import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  Plus,
  Search,
  Sparkles
} from 'lucide-react';
import { SimulatorUser, Contact, CallSession } from '../../../types/ios';
import { soundService } from '../../../services/soundService';
import { webrtcService } from '../../../services/webrtcService';

interface FaceTimeAppProps {
  currentUser: SimulatorUser;
  contacts: Contact[];
  activeCall: CallSession | null;
  callDuration: number;
  onStartFaceTimeCall: (peerPhone: string, peerName?: string) => void;
  onEndCall: () => void;
}

export const FaceTimeApp: React.FC<FaceTimeAppProps> = ({
  currentUser,
  contacts,
  activeCall,
  callDuration,
  onStartFaceTimeCall,
  onEndCall,
}) => {
  const [targetPhone, setTargetPhone] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Bind WebRTC streams to video elements
  useEffect(() => {
    webrtcService.onLocalStream = (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    webrtcService.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If in an active video call, show full screen FaceTime video UI
  if (activeCall && activeCall.callType === 'video') {
    const peerName = activeCall.callerId === currentUser.uid ? activeCall.receiverName : activeCall.callerName;

    return (
      <div className="relative w-full h-full bg-black text-white flex flex-col justify-between select-none overflow-hidden">
        {/* Remote Video (Full Screen Background) */}
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Fallback if remote video track hasn't rendered yet */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black/80 z-0 pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-emerald-700/40 border border-emerald-500/30 flex items-center justify-center text-3xl font-bold mb-3 shadow-2xl">
              {peerName ? peerName[0] : 'F'}
            </div>
            <p className="text-xl font-bold">{peerName}</p>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              {activeCall.status === 'ringing' ? 'Connecting FaceTime...' : formatDuration(callDuration)}
            </p>
          </div>
        </div>

        {/* Floating Local Camera Pip (Picture in picture) */}
        <motion.div
          drag
          dragConstraints={{ left: 10, right: 230, top: 50, bottom: 600 }}
          className="absolute top-16 right-4 z-20 w-28 h-40 rounded-2xl bg-neutral-800 border-2 border-white/20 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded-sm text-white/80">
            You
          </div>
        </motion.div>

        {/* Top Header Banner */}
        <div className="relative z-10 pt-14 px-6 flex items-center justify-between">
          <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">{peerName}</span>
            <span className="text-xs font-mono text-emerald-400">{formatDuration(callDuration)}</span>
          </div>
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="relative z-10 pb-12 px-6 flex items-center justify-center gap-4">
          <div className="bg-neutral-900/80 backdrop-blur-2xl rounded-full p-2 px-5 flex items-center gap-4 border border-white/10 shadow-2xl">
            {/* Toggle Mic */}
            <button
              onClick={() => {
                soundService.playTap();
                const muted = webrtcService.toggleMute();
                setIsMuted(muted);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Video */}
            <button
              onClick={() => {
                soundService.playTap();
                const enabled = webrtcService.toggleVideo();
                setIsVideoDisabled(!enabled);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoDisabled ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Flip camera */}
            <button
              onClick={() => soundService.playTap()}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* End Call */}
            <button
              onClick={() => {
                soundService.playTap();
                onEndCall();
              }}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Idle FaceTime Screen: Directory & New FaceTime Call
  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-8 px-5 select-none overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">FaceTime</h1>
          <button
            onClick={() => {
              if (targetPhone) {
                soundService.playTap();
                onStartFaceTimeCall(targetPhone);
              }
            }}
            className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow hover:bg-emerald-400"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* New Call Input */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 mb-4 shadow">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            New FaceTime Call
          </label>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="Enter simulator phone or name"
              className="bg-transparent flex-1 text-sm outline-hidden text-white placeholder-neutral-500"
            />
            {targetPhone && (
              <button
                onClick={() => {
                  soundService.playTap();
                  onStartFaceTimeCall(targetPhone);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow"
              >
                <Video className="w-3.5 h-3.5 fill-current" />
                Call
              </button>
            )}
          </div>
        </div>

        {/* Contacts to FaceTime */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Suggested Contacts
          </p>

          <div className="divide-y divide-neutral-800">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="py-3 flex items-center justify-between hover:bg-neutral-900/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-800/40 border border-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{contact.phoneNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundService.playTap();
                    onStartFaceTimeCall(contact.phoneNumber, contact.name);
                  }}
                  className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow transition-all active:scale-95"
                >
                  <Video className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
