import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Star,
  Clock,
  Users,
  Grid,
  Voicemail,
  Delete,
  Mic,
  MicOff,
  Volume2,
  Video,
  Plus,
  Info,
  Search
} from 'lucide-react';
import { SimulatorUser, Contact, CallLog, CallSession } from '../../../types/ios';
import { soundService } from '../../../services/soundService';
import { webrtcService } from '../../../services/webrtcService';
import { ContactsService } from '../../../services/contactsService';

interface PhoneAppProps {
  currentUser: SimulatorUser;
  contacts: Contact[];
  callLogs: CallLog[];
  activeCall: CallSession | null;
  callDuration: number;
  onStartCall: (peerPhone: string, peerName?: string, isVideo?: boolean) => void;
  onEndCall: () => void;
  onAddContactFromNumber?: (phone: string) => void;
}

export const PhoneApp: React.FC<PhoneAppProps> = ({
  currentUser,
  contacts,
  callLogs,
  activeCall,
  callDuration,
  onStartCall,
  onEndCall,
  onAddContactFromNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail'>('keypad');
  const [keypadInput, setKeypadInput] = useState('');
  const [recentsFilter, setRecentsFilter] = useState<'all' | 'missed'>('all');
  const [searchContact, setSearchContact] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const keypadButtons = [
    { digit: '1', sub: '' },
    { digit: '2', sub: 'A B C' },
    { digit: '3', sub: 'D E F' },
    { digit: '4', sub: 'G H I' },
    { digit: '5', sub: 'J K L' },
    { digit: '6', sub: 'M N O' },
    { digit: '7', sub: 'P Q R S' },
    { digit: '8', sub: 'T U V' },
    { digit: '9', sub: 'W X Y Z' },
    { digit: '*', sub: '' },
    { digit: '0', sub: '+' },
    { digit: '#', sub: '' },
  ];

  const handleDigitPress = (digit: string) => {
    soundService.playDtmfTone(digit);
    setKeypadInput(prev => prev + digit);
  };

  const handleBackspace = () => {
    soundService.playTap();
    setKeypadInput(prev => prev.slice(0, -1));
  };

  const handleCall = (phoneToCall?: string, name?: string) => {
    const target = phoneToCall || keypadInput;
    if (!target) return;
    soundService.playTap();
    onStartCall(target, name || target, false);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If in an active call, show the in-call screen
  if (activeCall) {
    const peerName = activeCall.callerId === currentUser.uid ? activeCall.receiverName : activeCall.callerName;
    const peerPhone = activeCall.callerId === currentUser.uid ? activeCall.receiverPhone : activeCall.callerPhone;

    return (
      <div className="w-full h-full bg-neutral-900 text-white flex flex-col justify-between pt-16 pb-12 px-6 select-none">
        {/* Caller Info */}
        <div className="flex flex-col items-center mt-6">
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            {activeCall.status === 'ringing' ? 'Calling...' : 'iPhone Audio'}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-center truncate max-w-[280px]">
            {peerName || 'Unknown'}
          </h2>
          <p className="text-sm text-neutral-400 font-mono mt-1">{peerPhone}</p>
          <p className="text-sm text-emerald-400 font-mono font-medium mt-2">
            {activeCall.status === 'ringing' ? 'Ringing...' : formatDuration(callDuration)}
          </p>
        </div>

        {/* In-Call 2x3 Action Grid */}
        <div className="grid grid-cols-3 gap-6 px-4 my-6">
          {/* Mute */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                soundService.playTap();
                const muted = webrtcService.toggleMute();
                setIsMuted(muted);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-white text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="text-[11px] text-neutral-300">mute</span>
          </div>

          {/* Keypad */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => soundService.playTap()}
              className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all"
            >
              <Grid className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-neutral-300">keypad</span>
          </div>

          {/* Speaker */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                soundService.playTap();
                setIsSpeaker(!isSpeaker);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isSpeaker ? 'bg-white text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-neutral-300">audio</span>
          </div>

          {/* Add Call */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => soundService.playTap()}
              className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-neutral-300">add call</span>
          </div>

          {/* FaceTime */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => soundService.playTap()}
              className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all"
            >
              <Video className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-neutral-300">FaceTime</span>
          </div>

          {/* Contacts */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => soundService.playTap()}
              className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all"
            >
              <Users className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-neutral-300">contacts</span>
          </div>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center pb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundService.playTap();
              onEndCall();
            }}
            className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/40"
          >
            <PhoneOff className="w-8 h-8" />
          </motion.button>
        </div>
      </div>
    );
  }

  // Filter recents
  const filteredRecents = callLogs.filter(log => {
    if (recentsFilter === 'missed') return log.direction === 'missed';
    return true;
  });

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-12 select-none overflow-hidden">
      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {/* KEYPAD TAB */}
        {activeTab === 'keypad' && (
          <div className="flex flex-col items-center justify-between h-full pt-4 pb-2">
            {/* Display Number */}
            <div className="h-16 flex flex-col items-center justify-center w-full px-4">
              <span className="text-3xl font-light font-mono tracking-tight text-white truncate max-w-full">
                {keypadInput || ' '}
              </span>
              {keypadInput && (
                <button
                  onClick={() => {
                    if (onAddContactFromNumber) onAddContactFromNumber(keypadInput);
                  }}
                  className="text-xs text-blue-400 hover:underline mt-0.5"
                >
                  Add Number
                </button>
              )}
            </div>

            {/* Keypad Grid (3 columns) */}
            <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 my-2">
              {keypadButtons.map(({ digit, sub }) => (
                <motion.button
                  key={digit}
                  whileTap={{ scale: 0.92, backgroundColor: '#525252' }}
                  onClick={() => handleDigitPress(digit)}
                  className="w-17 h-17 rounded-full bg-neutral-800 text-white flex flex-col items-center justify-center transition-colors active:bg-neutral-600 shadow"
                >
                  <span className="text-2xl font-light leading-none">{digit}</span>
                  {sub && <span className="text-[9px] font-semibold tracking-widest text-neutral-400 mt-0.5">{sub}</span>}
                </motion.button>
              ))}
            </div>

            {/* Bottom Actions: Call and Backspace */}
            <div className="w-full grid grid-cols-3 items-center justify-items-center mt-2 pb-2">
              <div />
              {/* Green Call Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCall()}
                disabled={!keypadInput}
                className={`w-17 h-17 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                  keypadInput ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30' : 'bg-emerald-900/50 opacity-40 cursor-not-allowed'
                }`}
              >
                <Phone className="w-8 h-8 fill-current" />
              </motion.button>

              {/* Backspace Button */}
              {keypadInput ? (
                <button
                  onClick={handleBackspace}
                  className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <Delete className="w-6 h-6" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}

        {/* RECENTS TAB */}
        {activeTab === 'recents' && (
          <div className="flex flex-col h-full pt-1">
            {/* Segmented Control: All / Missed */}
            <div className="flex justify-center mb-3">
              <div className="bg-neutral-800 p-0.5 rounded-lg flex text-xs">
                <button
                  onClick={() => setRecentsFilter('all')}
                  className={`px-4 py-1 rounded-md font-medium transition-colors ${
                    recentsFilter === 'all' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRecentsFilter('missed')}
                  className={`px-4 py-1 rounded-md font-medium transition-colors ${
                    recentsFilter === 'missed' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Missed
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2">Recents</h1>

            {/* List of Calls */}
            {filteredRecents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-sm">
                <Clock className="w-10 h-10 mb-2 opacity-50" />
                <p>No Recent Calls</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredRecents.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => handleCall(log.peerPhone, log.peerName)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-900/60 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {log.direction === 'missed' ? (
                        <PhoneMissed className="w-4 h-4 text-red-500" />
                      ) : log.direction === 'incoming' ? (
                        <PhoneIncoming className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <PhoneOutgoing className="w-4 h-4 text-emerald-500" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${log.direction === 'missed' ? 'text-red-500' : 'text-white'}`}>
                          {log.peerName || log.peerPhone}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">{log.peerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Info className="w-4 h-4 text-blue-400 opacity-60 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div className="flex flex-col h-full pt-1">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Contacts</h1>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Search"
                className="w-full bg-neutral-800 text-white rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="divide-y divide-neutral-800 flex-1 overflow-y-auto">
              {contacts
                .filter(c => c.name.toLowerCase().includes(searchContact.toLowerCase()) || c.phoneNumber.includes(searchContact))
                .map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleCall(contact.phoneNumber, contact.name)}
                    className="py-2.5 px-2 flex items-center justify-between cursor-pointer hover:bg-neutral-900 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{contact.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">{contact.phoneNumber}</p>
                    </div>
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div className="flex flex-col h-full pt-1">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Favorites</h1>
            <div className="divide-y divide-neutral-800">
              {contacts.filter(c => c.isFavorite).map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleCall(contact.phoneNumber, contact.name)}
                  className="py-3 px-2 flex items-center justify-between cursor-pointer hover:bg-neutral-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {contact.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{contact.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">{contact.phoneNumber}</p>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VOICEMAIL TAB */}
        {activeTab === 'voicemail' && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm">
            <Voicemail className="w-12 h-12 mb-3 opacity-40 text-neutral-400" />
            <p className="font-medium text-neutral-400">No Voicemail</p>
            <p className="text-xs text-neutral-600 mt-1">Simulator voicemail box is empty.</p>
          </div>
        )}
      </div>

      {/* Bottom 5-Tab Bar */}
      <div className="h-16 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-lg grid grid-cols-5 items-center px-1">
        <button
          onClick={() => {
            soundService.playTap();
            setActiveTab('favorites');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'favorites' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
        >
          <Star className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-medium">Favorites</span>
        </button>

        <button
          onClick={() => {
            soundService.playTap();
            setActiveTab('recents');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'recents' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium">Recents</span>
        </button>

        <button
          onClick={() => {
            soundService.playTap();
            setActiveTab('contacts');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'contacts' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Contacts</span>
        </button>

        <button
          onClick={() => {
            soundService.playTap();
            setActiveTab('keypad');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'keypad' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Keypad</span>
        </button>

        <button
          onClick={() => {
            soundService.playTap();
            setActiveTab('voicemail');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'voicemail' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
        >
          <Voicemail className="w-5 h-5" />
          <span className="text-[10px] font-medium">Voicemail</span>
        </button>
      </div>
    </div>
  );
};
