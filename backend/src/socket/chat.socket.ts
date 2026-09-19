import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { getSupabase } from '../config/supabase';
import { chatMessages, chatRooms, createId, saveMessageOnce } from '../data/memoryStore';
import { ChatMessage, MessageType } from '../types/api';
import { persistChatMessage, persistChatRoomActivity, persistLastReadMessage } from '../services/persistence.service';

export const createChatSocket = (server: Server): SocketServer => {
  const origins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['http://localhost:5173'];
  const io = new SocketServer(server, { path: '/chat', cors: { origin: origins, credentials: true } });
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.accessToken;
    if (!token) return next(new Error('accessToken이 필요합니다.'));
    try {
      const { data, error } = await getSupabase().auth.getUser(token);
      if (error || !data.user) return next(new Error('유효하지 않은 토큰입니다.'));
      socket.data.userId = data.user.id; next();
    } catch { next(new Error('인증 서비스 오류')); }
  });
  io.on('connection', (socket) => {
    const userId = String(socket.data.userId);
    socket.on('chat:join', ({ roomId }, ack = () => undefined) => {
      const room = chatRooms.get(roomId);
      if (!room?.participantIds.includes(userId)) return ack({ error: '채팅방 참여자가 아닙니다.' });
      socket.join(roomId); socket.emit('chat:joined', { roomId }); ack({ roomId });
    });
    socket.on('message:send', async (payload: { roomId: string; clientMessageId: string; content: string; messageType: MessageType }, ack = () => undefined) => {
      const room = chatRooms.get(payload.roomId);
      if (!room?.participantIds.includes(userId)) return ack({ error: '채팅방 참여자가 아닙니다.' });
      if (!payload.clientMessageId || !payload.content || !['TEXT', 'LINK'].includes(payload.messageType)) return ack({ error: '메시지 형식이 올바르지 않습니다.' });
      const message: ChatMessage = { id: createId(), roomId: payload.roomId, senderId: userId, clientMessageId: payload.clientMessageId, content: payload.content, messageType: payload.messageType, readBy: [userId], createdAt: new Date().toISOString() };
      try { await persistChatMessage(message); await persistChatRoomActivity(message.roomId, message.createdAt); }
      catch (error) { return ack({ error: error instanceof Error ? error.message : '메시지 저장 실패' }); }
      const saved = saveMessageOnce(message); ack({ message: saved.message, duplicated: !saved.created });
      if (saved.created) io.to(payload.roomId).emit('message:new', { message: saved.message });
    });
    socket.on('message:read', async ({ roomId, lastReadMessageId }, ack = () => undefined) => {
      const room = chatRooms.get(roomId); if (!room?.participantIds.includes(userId)) return ack({ error: '채팅방 참여자가 아닙니다.' });
      const messages = chatMessages.get(roomId) ?? []; const lastIndex = messages.findIndex((item) => item.id === lastReadMessageId);
      if (lastIndex < 0) return ack({ error: '메시지를 찾을 수 없습니다.' });
      try { await persistLastReadMessage(roomId, userId, lastReadMessageId); }
      catch (error) { return ack({ error: error instanceof Error ? error.message : '읽음 상태 저장 실패' }); }
      messages.slice(0, lastIndex + 1).forEach((item) => { if (!item.readBy.includes(userId)) item.readBy.push(userId); });
      io.to(roomId).emit('message:read', { roomId, userId, lastReadMessageId }); ack({ roomId, lastReadMessageId });
    });
    socket.on('chat:leave', ({ roomId }, ack = () => undefined) => { socket.leave(roomId); ack({ roomId }); });
  });
  return io;
};
