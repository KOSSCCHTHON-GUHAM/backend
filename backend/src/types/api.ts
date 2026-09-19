export type RecruitmentStatus = 'RECRUITING' | 'COMPLETED';
export type MessageType = 'TEXT' | 'LINK';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  giveFields: string[];
  interests: string[];
  regions: string[];
  customGiveText?: string;
  customInterestText?: string;
  normalizedGiveTags: string[];
  normalizedInterestTags: string[];
  onboardingCompleted: boolean;
}

export interface BoardDetail {
  id: string;
  authorId: string;
  title: string;
  category: string;
  recruitCount: number;
  content: string;
  giveTags: string[];
  needTags: string[];
  activityRegion: string;
  activityMethod: string;
  activityHours: string;
  relatedLinks: string[];
  imageUrls: string[];
  recruitment: { current: number; target: number; status: RecruitmentStatus };
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  participantIds: string[];
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  clientMessageId: string;
  content: string;
  messageType: MessageType;
  readBy: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
