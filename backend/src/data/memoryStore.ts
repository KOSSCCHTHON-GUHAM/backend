import { randomUUID } from 'crypto';
import { AppNotification, BoardDetail, ChatMessage, ChatRoom, UserProfile } from '../types/api';

export const profiles = new Map<string, UserProfile>();
export const boards = new Map<string, BoardDetail>();
export const chatRooms = new Map<string, ChatRoom>();
export const chatMessages = new Map<string, ChatMessage[]>();
export const notifications = new Map<string, AppNotification>();

export const createId = (): string => randomUUID();

export const findDirectRoom = (userId: string, targetUserId: string, boardId: string): ChatRoom | undefined =>
  [...chatRooms.values()].find(
    (room) => room.boardId === boardId && room.participantIds.includes(userId) && room.participantIds.includes(targetUserId),
  );

export const saveMessageOnce = (message: ChatMessage): { message: ChatMessage; created: boolean } => {
  const messages = chatMessages.get(message.roomId) ?? [];
  const existing = messages.find(
    (item) => item.senderId === message.senderId && item.clientMessageId === message.clientMessageId,
  );
  if (existing) return { message: existing, created: false };
  messages.push(message);
  chatMessages.set(message.roomId, messages);
  const room = chatRooms.get(message.roomId);
  if (room) room.updatedAt = message.createdAt;
  return { message, created: true };
};
