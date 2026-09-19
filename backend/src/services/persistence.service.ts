import { getSupabaseAdmin } from '../config/supabase';
import { BoardDetail, ChatMessage, ChatRoom } from '../types/api';
import { boards, chatMessages, chatRooms, createId, notifications, profiles } from '../data/memoryStore';

export const hydrateMemoryStore = async (): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const [profileResult, boardResult, roomResult, participantResult, messageResult, notificationResult] = await Promise.all([
    admin.from('profiles').select('*'), admin.from('boards').select('*'), admin.from('chat_rooms').select('*'),
    admin.from('chat_room_participants').select('*'), admin.from('chat_messages').select('*').order('created_at'),
    admin.from('notifications').select('*').order('created_at'),
  ]);
  const firstError = [profileResult, boardResult, roomResult, participantResult, messageResult, notificationResult].find((result) => result.error)?.error;
  if (firstError) throw new Error(`Supabase 초기 데이터 로드 실패: ${firstError.message}`);
  profiles.clear(); boards.clear(); chatRooms.clear(); chatMessages.clear(); notifications.clear();
  for (const row of profileResult.data ?? []) profiles.set(row.id, {
    id: row.id, email: '', nickname: row.nickname, avatarUrl: row.avatar_url,
    giveFields: row.give_fields ?? [], interests: row.interests ?? [], regions: row.regions ?? [],
    customGiveText: row.custom_give_text, customInterestText: row.custom_interest_text,
    normalizedGiveTags: row.normalized_give_tags ?? [], normalizedInterestTags: row.normalized_interest_tags ?? [], onboardingCompleted: Boolean(row.onboarding_completed),
  });
  for (const row of boardResult.data ?? []) boards.set(row.id, {
    id: row.id, authorId: row.author_id, title: row.title, category: row.category, recruitCount: row.recruit_count,
    content: row.content, giveTags: row.give_tags ?? [], needTags: row.need_tags ?? [], activityRegion: row.activity_region,
    activityMethod: row.activity_method, activityHours: row.activity_hours, relatedLinks: row.related_links ?? [], imageUrls: row.image_urls ?? [],
    recruitment: { current: row.current_count, target: row.recruit_count, status: row.status }, createdAt: row.created_at, updatedAt: row.updated_at,
  });
  const participantMap = new Map<string, string[]>();
  for (const row of participantResult.data ?? []) participantMap.set(row.room_id, [...(participantMap.get(row.room_id) ?? []), row.user_id]);
  for (const row of roomResult.data ?? []) { chatRooms.set(row.id, { id: row.id, boardId: row.board_id, participantIds: participantMap.get(row.id) ?? [], createdAt: row.created_at, updatedAt: row.updated_at }); chatMessages.set(row.id, []); }
  for (const row of messageResult.data ?? []) (chatMessages.get(row.room_id) ?? []).push({ id: row.id, roomId: row.room_id, senderId: row.sender_id, clientMessageId: row.client_message_id, content: row.content, messageType: row.message_type, readBy: [row.sender_id], createdAt: row.created_at });
  for (const row of notificationResult.data ?? []) notifications.set(row.id, { id: row.id, userId: row.user_id, type: row.type, title: row.title, body: row.body, isRead: row.is_read, createdAt: row.created_at });
};

export const storeBoardImages = async (userId: string, boardId: string, files: Express.Multer.File[]): Promise<string[]> => {
  const admin = getSupabaseAdmin();
  if (!admin) return files.map((file) => `memory://${boardId}/${encodeURIComponent(file.originalname)}`);
  const urls: string[] = [];
  for (const file of files) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${boardId}/${createId()}-${safeName}`;
    const { error } = await admin.storage.from('board-images').upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new Error(`이미지 저장 실패: ${error.message}`);
    urls.push(admin.storage.from('board-images').getPublicUrl(path).data.publicUrl);
  }
  return urls;
};

export const persistBoard = async (board: BoardDetail): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('boards').insert({
    id: board.id, author_id: board.authorId, title: board.title, category: board.category,
    recruit_count: board.recruitCount, current_count: board.recruitment.current, status: board.recruitment.status,
    content: board.content, give_tags: board.giveTags, need_tags: board.needTags,
    activity_region: board.activityRegion, activity_method: board.activityMethod, activity_hours: board.activityHours,
    related_links: board.relatedLinks, image_urls: board.imageUrls, created_at: board.createdAt, updated_at: board.updatedAt,
  });
  if (error) throw new Error(`포스팅 DB 저장 실패: ${error.message}`);
};

export const updatePersistedBoard = async (board: BoardDetail): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('boards').update({
    title: board.title, category: board.category, recruit_count: board.recruitCount,
    content: board.content, give_tags: board.giveTags, need_tags: board.needTags,
    activity_region: board.activityRegion, activity_method: board.activityMethod,
    activity_hours: board.activityHours, related_links: board.relatedLinks, updated_at: board.updatedAt,
  }).eq('id', board.id).eq('author_id', board.authorId);
  if (error) throw new Error(`포스팅 DB 수정 실패: ${error.message}`);
};

export const deletePersistedBoard = async (id: string, authorId: string): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('boards').delete().eq('id', id).eq('author_id', authorId);
  if (error) throw new Error(`포스팅 DB 삭제 실패: ${error.message}`);
};

export const persistChatRoom = async (room: ChatRoom): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error: roomError } = await admin.from('chat_rooms').insert({ id: room.id, board_id: room.boardId, created_at: room.createdAt, updated_at: room.updatedAt });
  if (roomError) throw new Error(`채팅방 DB 저장 실패: ${roomError.message}`);
  const { error: memberError } = await admin.from('chat_room_participants').insert(room.participantIds.map((userId) => ({ room_id: room.id, user_id: userId })));
  if (memberError) throw new Error(`채팅 참여자 DB 저장 실패: ${memberError.message}`);
};

export const persistChatMessage = async (message: ChatMessage): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('chat_messages').upsert({
    id: message.id, room_id: message.roomId, sender_id: message.senderId, client_message_id: message.clientMessageId,
    content: message.content, message_type: message.messageType, created_at: message.createdAt,
  }, { onConflict: 'sender_id,client_message_id', ignoreDuplicates: true });
  if (error) throw new Error(`메시지 DB 저장 실패: ${error.message}`);
};

export const persistChatRoomActivity = async (roomId: string, updatedAt: string): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('chat_rooms').update({ updated_at: updatedAt }).eq('id', roomId);
  if (error) throw new Error(`채팅방 갱신 실패: ${error.message}`);
};

export const persistLastReadMessage = async (roomId: string, userId: string, messageId: string): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('chat_room_participants').update({ last_read_message_id: messageId })
    .eq('room_id', roomId).eq('user_id', userId);
  if (error) throw new Error(`읽음 상태 저장 실패: ${error.message}`);
};

export const persistNotificationRead = async (notificationId: string, userId: string): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', userId);
  if (error) throw new Error(`알림 읽음 상태 저장 실패: ${error.message}`);
};

export const persistAllNotificationsRead = async (userId: string): Promise<void> => {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { error } = await admin.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw new Error(`전체 알림 읽음 상태 저장 실패: ${error.message}`);
};
