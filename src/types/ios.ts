export interface SimulatorUser {
  uid: string;
  displayName: string;
  phoneNumber: string; // Simulated phone identity, e.g. +1 (555) 234-8901
  photoURL?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  isFavorite?: boolean;
  photoURL?: string;
  updatedAt?: string;
}

export interface CallLog {
  id: string;
  peerId?: string;
  peerName: string;
  peerPhone: string;
  peerPhoto?: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  duration?: number; // in seconds
  timestamp: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: string;
  endedAt?: string;
  duration?: number;
}

export interface IceCandidateData {
  candidate: RTCIceCandidateInit;
  senderId: string;
  type: 'caller' | 'receiver';
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, {
    displayName: string;
    phoneNumber: string;
    photoURL?: string;
  }>;
  lastMessageText?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  unreadCounts?: Record<string, number>;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string; // base64 or audio blob URL
  timestamp: string;
  reactions?: Record<string, string>; // userId -> emoji (❤️, 👍, 👎, 😂, ‼️, ❓)
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

export type AppId =
  | 'phone'
  | 'messages'
  | 'contacts'
  | 'facetime'
  | 'camera'
  | 'photos'
  | 'safari'
  | 'settings'
  | 'clock'
  | 'calculator'
  | 'weather'
  | 'notes'
  | 'voicememos'
  | 'music'
  | 'calendar'
  | 'reminders'
  | 'maps'
  | 'appstore'
  | 'files';

export interface AppMetadata {
  id: AppId;
  name: string;
  icon: string; // Lucide icon name or SVG representation
  gradient: string;
  badgeCount?: number;
  isDock?: boolean;
}

export interface DynamicIslandAlert {
  id: string;
  type: 'call' | 'music' | 'timer' | 'silent' | 'charging';
  title: string;
  subtitle?: string;
  duration?: number; // ms to auto-collapse
  expandedContent?: React.ReactNode;
}

export interface NotificationItem {
  id: string;
  appId: AppId;
  appName: string;
  title: string;
  body: string;
  time: string;
  read?: boolean;
}

export interface DeviceSettings {
  wallpaperId: string;
  isDarkMode: boolean;
  isSilent: boolean;
  volume: number; // 0-100
  brightness: number; // 0-100
  wifiEnabled: boolean;
  cellularEnabled: boolean;
  bluetoothEnabled: boolean;
  airplaneMode: boolean;
  flashlightOn: boolean;
  batteryPercentage: number;
  lowPowerMode: boolean;
  deviceColor: 'natural' | 'black' | 'white' | 'desert';
}
