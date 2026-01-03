
export interface User {
  id: string;
  username: string;
  avatar: string;
  meritScore: number;
  followersCount?: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  aiBadge?: {
    label: string;
    color: string;
    description: string;
  };
  comments: Comment[];
  isReel?: boolean;
}

export interface Reel extends Post {
  isReel: true;
  videoUrl: string;
}

export interface Story {
  id: string;
  author: User;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: Date;
  isSeen: boolean;
  isHighMerit?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'SENT' | 'DELIVERED' | 'READ';
}

export interface ChatRoom {
  id: string;
  participant: User;
  lastMessage?: string;
  unreadCount: number;
  messages: Message[];
  isOnline: boolean;
}

export enum FeedType {
  DISCOVERY = 'DISCOVERY',
  TRENDING_GEMS = 'TRENDING_GEMS',
  NEW_MINDS = 'NEW_MINDS',
  REELS = 'REELS',
  PROFILE = 'PROFILE',
  MESSAGES = 'MESSAGES'
}

export type NotificationType = 'UPVOTE' | 'COMMENT' | 'SHARE' | 'FOLLOW_REQUEST' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  actor?: User;
  content?: string;
  postId?: string;
  timestamp: Date;
  read: boolean;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}
