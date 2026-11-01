import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  Unsubscribe,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Conversation, ChatMessage } from '../types/ios';
import { soundService } from './soundService';

export class MessageService {
  // Listen to all conversations where current user is a participant
  static listenConversations(userId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
    const convRef = collection(db, 'conversations');
    const q = query(
      convRef,
      where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach(docSnap => {
        convs.push({ id: docSnap.id, ...(docSnap.data() as Omit<Conversation, 'id'>) });
      });
      // Sort by updatedAt descending
      convs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      callback(convs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'conversations');
    });
  }

  // Get or create conversation between 2 simulator users
  static async getOrCreateConversation(
    user1: { uid: string; displayName: string; phoneNumber: string; photoURL?: string },
    user2: { uid: string; displayName: string; phoneNumber: string; photoURL?: string }
  ): Promise<string> {
    const convRef = collection(db, 'conversations');
    const q = query(convRef, where('participantIds', 'array-contains', user1.uid));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as Conversation;
      if (data.participantIds.includes(user2.uid) && data.participantIds.length === 2) {
        return docSnap.id;
      }
    }

    // Create new conversation
    const newDoc = doc(convRef);
    const convData: Conversation = {
      id: newDoc.id,
      participantIds: [user1.uid, user2.uid],
      participantDetails: {
        [user1.uid]: {
          displayName: user1.displayName,
          phoneNumber: user1.phoneNumber,
          photoURL: user1.photoURL || '',
        },
        [user2.uid]: {
          displayName: user2.displayName,
          phoneNumber: user2.phoneNumber,
          photoURL: user2.photoURL || '',
        },
      },
      lastMessageText: '',
      lastMessageTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCounts: {
        [user1.uid]: 0,
        [user2.uid]: 0,
      },
    };

    await setDoc(newDoc, convData);
    return newDoc.id;
  }

  // Listen to messages inside a conversation
  static listenMessages(conversationId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        messages.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatMessage, 'id'>) });
      });
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `conversations/${conversationId}/messages`);
    });
  }

  // Send message
  static async sendMessage(
    conversationId: string,
    sender: { uid: string; displayName: string },
    text: string,
    type: 'text' | 'image' | 'voice' = 'text',
    mediaUrl?: string,
    replyTo?: ChatMessage['replyTo']
  ): Promise<string> {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const newMsgDoc = doc(messagesRef);

      const msgData: ChatMessage = {
        id: newMsgDoc.id,
        conversationId,
        senderId: sender.uid,
        senderName: sender.displayName,
        text,
        type,
        mediaUrl: mediaUrl || '',
        timestamp: new Date().toISOString(),
        reactions: {},
        replyTo: replyTo || undefined,
      };

      await setDoc(newMsgDoc, msgData);

      // Update conversation last message snippet
      const convDocRef = doc(db, 'conversations', conversationId);
      const displayText = type === 'image' ? '📷 Photo' : type === 'voice' ? '🎤 Voice Message' : text;
      await updateDoc(convDocRef, {
        lastMessageText: displayText,
        lastMessageTime: msgData.timestamp,
        lastMessageSenderId: sender.uid,
        updatedAt: msgData.timestamp,
      });

      soundService.playMessageSentSound();
      return newMsgDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}/messages`);
      throw error;
    }
  }

  // Add Tapback Reaction (❤️, 👍, 👎, 😂, ‼️, ❓)
  static async reactToMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    reaction: string
  ): Promise<void> {
    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      // Toggle reaction if same is tapped
      await updateDoc(msgRef, {
        [`reactions.${userId}`]: reaction,
      });
      soundService.playTap();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}/messages/${messageId}`);
    }
  }

  // Delete message
  static async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await deleteDoc(msgRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `conversations/${conversationId}/messages/${messageId}`);
    }
  }
}
