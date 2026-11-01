import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Edit3,
  ChevronLeft,
  Phone,
  Video,
  Info,
  Mic,
  Camera,
  ArrowUp,
  Image as ImageIcon,
  Smile,
  Play,
  Pause,
  Trash2,
  X
} from 'lucide-react';
import { SimulatorUser, Contact, Conversation, ChatMessage } from '../../../types/ios';
import { soundService } from '../../../services/soundService';
import { MessageService } from '../../../services/messageService';

interface MessagesAppProps {
  currentUser: SimulatorUser;
  contacts: Contact[];
  conversations: Conversation[];
  onStartAudioCall: (phone: string, name: string) => void;
  onStartVideoCall: (phone: string, name: string) => void;
  initialRecipientPhone?: string;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({
  currentUser,
  contacts,
  conversations,
  onStartAudioCall,
  onStartVideoCall,
  initialRecipientPhone,
}) => {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);

  // Audio voice note recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to messages when conversation is opened
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const unsub = MessageService.listenMessages(activeConvId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [activeConvId]);

  // Handle initial recipient from contacts/calls
  useEffect(() => {
    if (initialRecipientPhone) {
      // Find matching contact or conversation
      const foundConv = conversations.find(c => {
        const details = Object.values(c.participantDetails);
        return details.some(d => d.phoneNumber === initialRecipientPhone);
      });
      if (foundConv) {
        setActiveConvId(foundConv.id);
      } else {
        setIsComposingNew(true);
        setNewRecipientInput(initialRecipientPhone);
      }
    }
  }, [initialRecipientPhone, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Determine peer details for active conversation
  const peerUserId = activeConversation?.participantIds.find(id => id !== currentUser.uid) || '';
  const peerDetail = activeConversation?.participantDetails[peerUserId] || {
    displayName: 'Simulated User',
    phoneNumber: '+1 (555) 000-0000',
    photoURL: '',
  };

  const handleSendMessage = async (textToSend?: string, type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const content = textToSend !== undefined ? textToSend : inputText;
    if (!content.trim() && type === 'text') return;
    if (!activeConvId) return;

    soundService.playTap();
    setInputText('');

    try {
      await MessageService.sendMessage(
        activeConvId,
        { uid: currentUser.uid, displayName: currentUser.displayName },
        content,
        type,
        mediaUrl
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Start Voice Note Recording
  const startVoiceRecording = async () => {
    try {
      soundService.playTap();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendMessage('Voice Message', 'voice', base64Audio);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission needed for voice message:', err);
      // Simulate voice note for testing
      handleSendMessage('Voice Message (Simulated Audio)', 'voice', 'simulated_audio');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Voice note playback
  const togglePlayAudio = (msgId: string, mediaUrl?: string) => {
    if (playingAudioId === msgId) {
      currentAudioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    if (mediaUrl && mediaUrl.startsWith('data:audio')) {
      const audio = new Audio(mediaUrl);
      currentAudioRef.current = audio;
      setPlayingAudioId(msgId);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
    } else {
      // Simulate audio play
      soundService.playTap();
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  // Start new conversation from recipient phone/contact
  const handleStartNewConversation = async (targetPhone: string, targetName: string) => {
    const targetUid = 'sim_' + targetPhone.replace(/\D/g, '');
    const convId = await MessageService.getOrCreateConversation(
      {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        phoneNumber: currentUser.phoneNumber,
        photoURL: currentUser.photoURL,
      },
      {
        uid: targetUid,
        displayName: targetName,
        phoneNumber: targetPhone,
      }
    );
    setIsComposingNew(false);
    setActiveConvId(convId);
  };

  const tapbackEmojis = ['❤️', '👍', '👎', '😂', '‼️', '❓'];

  // Conversation Detail View
  if (activeConvId) {
    return (
      <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-12 pb-3 select-none">
        {/* iOS iMessage Header */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
          {/* Back button */}
          <button
            onClick={() => {
              soundService.playTap();
              setActiveConvId(null);
            }}
            className="flex items-center text-blue-500 font-medium text-sm hover:opacity-80"
          >
            <ChevronLeft className="w-6 h-6 -ml-1.5" />
            <span>Messages</span>
          </button>

          {/* Contact Avatar & Info */}
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow overflow-hidden">
              {peerDetail.photoURL ? (
                <img src={peerDetail.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{peerDetail.displayName[0]}</span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-white truncate max-w-[120px]">
              {peerDetail.displayName}
            </span>
          </div>

          {/* Direct FaceTime & Audio Call shortcuts */}
          <div className="flex items-center gap-3 text-blue-500">
            <button
              onClick={() => {
                soundService.playTap();
                onStartVideoCall(peerDetail.phoneNumber, peerDetail.displayName);
              }}
              className="p-1 hover:opacity-80"
            >
              <Video className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => {
                soundService.playTap();
                onStartAudioCall(peerDetail.phoneNumber, peerDetail.displayName);
              }}
              className="p-1 hover:opacity-80"
            >
              <Phone className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Message Bubble Thread */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
              <p>iMessage with {peerDetail.displayName}</p>
              <p className="text-[10px] text-neutral-600 mt-1">{peerDetail.phoneNumber}</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.uid;
              const reactions = Object.values(msg.reactions || {});
              const isSelected = selectedMessageForReaction === msg.id;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}>
                  {/* Reaction Popup overlay */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: -45 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-30 bg-neutral-800/95 backdrop-blur-xl border border-white/20 rounded-full px-2 py-1 flex items-center gap-2 shadow-2xl"
                      >
                        {tapbackEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              MessageService.reactToMessage(activeConvId, msg.id, currentUser.uid, emoji);
                              setSelectedMessageForReaction(null);
                            }}
                            className="text-lg hover:scale-130 active:scale-95 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message Bubble */}
                  <div
                    onClick={() => {
                      soundService.playTap();
                      setSelectedMessageForReaction(isSelected ? null : msg.id);
                    }}
                    className={`relative max-w-[78%] px-3.5 py-2 rounded-2xl text-sm shadow-sm cursor-pointer select-text transition-all ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-neutral-800 text-white rounded-bl-xs'
                    }`}
                  >
                    {/* Image Message */}
                    {msg.type === 'image' && msg.mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-1 max-w-[200px]">
                        <img src={msg.mediaUrl} alt="" className="w-full h-auto object-cover" />
                      </div>
                    )}

                    {/* Voice Message */}
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-2.5 py-1 min-w-[140px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayAudio(msg.id, msg.mediaUrl);
                          }}
                          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"
                        >
                          {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div className="flex-1 flex items-center gap-0.5">
                          {[30, 70, 45, 90, 60, 40, 80, 50, 65, 35].map((h, i) => (
                            <div
                              key={i}
                              className={`w-0.5 rounded-full transition-all ${
                                playingAudioId === msg.id ? 'bg-white animate-pulse' : 'bg-white/60'
                              }`}
                              style={{ height: `${h * 0.2}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono opacity-80">0:04</span>
                      </div>
                    ) : (
                      <p className="leading-snug">{msg.text}</p>
                    )}

                    {/* Reaction Badges on Bubble */}
                    {reactions.length > 0 && (
                      <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-neutral-900 border border-white/20 rounded-full px-1.5 py-0.5 text-xs shadow flex items-center`}>
                        {reactions.slice(0, 3).map((r, i) => (
                          <span key={i}>{r}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator for latest message */}
                  {isMe && index === messages.length - 1 && (
                    <span className="text-[10px] text-neutral-500 mt-1 font-medium pr-1">
                      Delivered
                    </span>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-3 pt-2">
          {isRecordingAudio ? (
            <div className="flex items-center justify-between bg-red-950/40 border border-red-500/30 rounded-full px-4 py-2 text-red-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono font-bold">Recording... {recordingSeconds}s</span>
              </div>
              <button
                onClick={stopVoiceRecording}
                className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow hover:bg-red-400"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Camera Photo attachment */}
              <button
                onClick={() => {
                  soundService.playTap();
                  handleSendMessage('Shared photo', 'image', 'https://picsum.photos/seed/iphone/400/300');
                }}
                className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
                title="Send photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Text Input pill */}
              <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-3.5 py-1.5 flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="iMessage"
                  className="bg-transparent flex-1 text-sm text-white placeholder-neutral-500 outline-hidden"
                />

                {/* Voice Record Button or Blue Send Arrow */}
                {inputText.trim() ? (
                  <button
                    onClick={() => handleSendMessage()}
                    className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow hover:bg-blue-400 active:scale-95 transition-all"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={startVoiceRecording}
                    className="w-7 h-7 rounded-full text-neutral-400 hover:text-blue-400 flex items-center justify-center transition-colors"
                    title="Hold or tap to record voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Conversation List View
  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header with Compose button */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <button
            onClick={() => {
              soundService.playTap();
              setIsComposingNew(true);
            }}
            className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500 hover:bg-neutral-800"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-neutral-900 text-white rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* New Message Composer Modal */}
        <AnimatePresence>
          {isComposingNew && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 mb-3 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-300">New Message</span>
                <button onClick={() => setIsComposingNew(false)}>
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mb-2">Select a contact or enter a simulated phone number:</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRecipientInput}
                  onChange={(e) => setNewRecipientInput(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-lg outline-hidden"
                />
                <button
                  onClick={() => {
                    if (newRecipientInput) {
                      handleStartNewConversation(newRecipientInput, newRecipientInput);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                >
                  Start
                </button>
              </div>

              {/* Quick Contact Picker */}
              <div className="max-h-32 overflow-y-auto divide-y divide-neutral-800">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleStartNewConversation(c.phoneNumber, c.name)}
                    className="py-1.5 px-1 flex items-center justify-between hover:bg-neutral-800 rounded cursor-pointer text-xs"
                  >
                    <span>{c.name}</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{c.phoneNumber}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm">
              <p>No Conversations</p>
              <p className="text-xs text-neutral-600 mt-1">Tap the pencil icon to start an iMessage.</p>
            </div>
          ) : (
            conversations
              .filter(c => {
                const details = Object.values(c.participantDetails);
                return details.some(d => d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || d.phoneNumber.includes(searchQuery));
              })
              .map((conv) => {
                const peerId = conv.participantIds.find(id => id !== currentUser.uid) || '';
                const peer = conv.participantDetails[peerId] || {
                  displayName: 'User',
                  phoneNumber: '',
                  photoURL: '',
                };

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      soundService.playTap();
                      setActiveConvId(conv.id);
                    }}
                    className="py-3 px-1 flex items-center gap-3 cursor-pointer hover:bg-neutral-900/60 rounded-xl transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-sm text-white overflow-hidden shadow">
                        {peer.photoURL ? (
                          <img src={peer.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{peer.displayName[0]}</span>
                        )}
                      </div>
                    </div>

                    {/* Snippet */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-white truncate max-w-[170px]">
                          {peer.displayName}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {conv.lastMessageTime
                            ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">
                        {conv.lastMessageText || 'Tap to chat'}
                      </p>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
