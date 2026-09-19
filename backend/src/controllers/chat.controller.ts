import { Request, Response } from 'express';
import { boards, chatMessages, chatRooms, createId, findDirectRoom, profiles } from '../data/memoryStore';
import { ChatRoom } from '../types/api';
import { persistChatRoom } from '../services/persistence.service';

export class ChatController {
  async createRoom(req: Request, res: Response): Promise<void> {
    const { targetUserId, boardId } = req.body as { targetUserId?: string; boardId?: string };
    if (!targetUserId || !boardId) { res.status(400).json({ success: false, error: 'targetUserId와 boardId가 필요합니다.' }); return; }
    if (!boards.has(boardId)) { res.status(404).json({ success: false, error: '포스팅을 찾을 수 없습니다.' }); return; }
    const existing = findDirectRoom(req.user!.id, targetUserId, boardId);
    if (existing) { res.json({ room: existing, isNew: false }); return; }
    const now = new Date().toISOString();
    const room: ChatRoom = { id: createId(), participantIds: [req.user!.id, targetUserId], boardId, createdAt: now, updatedAt: now };
    try { await persistChatRoom(room); }
    catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '채팅방 저장 실패' }); return; }
    chatRooms.set(room.id, room); chatMessages.set(room.id, []);
    res.status(201).json({ room, isNew: true });
  }

  listRooms(req: Request, res: Response): void {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const items = [...chatRooms.values()].filter((room) => room.participantIds.includes(req.user!.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const rooms = items.slice((page - 1) * limit, page * limit).map((room) => {
      const messages = chatMessages.get(room.id) ?? []; const otherId = room.participantIds.find((id) => id !== req.user!.id)!;
      const other = profiles.get(otherId);
      return { id: room.id, otherUser: other ? { id: other.id, nickname: other.nickname } : { id: otherId, nickname: '알 수 없음' }, board: boards.get(room.boardId), lastMessage: messages.at(-1) ?? null, unreadCount: messages.filter((message) => !message.readBy.includes(req.user!.id)).length, updatedAt: room.updatedAt };
    });
    res.json({ rooms, total: items.length, hasNext: page * limit < items.length });
  }

  getMessages(req: Request, res: Response): void {
    const room = chatRooms.get(req.params.roomId);
    if (!room) { res.status(404).json({ success: false, error: '채팅방을 찾을 수 없습니다.' }); return; }
    if (!room.participantIds.includes(req.user!.id)) { res.status(403).json({ success: false, error: '채팅방 참여자가 아닙니다.' }); return; }
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50)); const all = chatMessages.get(room.id) ?? [];
    const cursorIndex = req.query.cursor ? all.findIndex((message) => message.id === req.query.cursor) : all.length;
    const end = cursorIndex < 0 ? all.length : cursorIndex; const start = Math.max(0, end - limit); const messages = all.slice(start, end);
    res.json({ room, messages, nextCursor: start > 0 ? all[start].id : null });
  }
}
