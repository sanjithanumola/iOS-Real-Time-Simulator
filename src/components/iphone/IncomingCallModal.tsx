import React from 'react';
import { motion } from 'motion/react';
import { Phone, PhoneOff, MessageSquare, Clock, Video } from 'lucide-react';
import { CallSession } from '../../types/ios';
import { soundService } from '../../services/soundService';

interface IncomingCallModalProps {
  call: CallSession;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 bg-neutral-900/95 backdrop-blur-2xl flex flex-col justify-between py-16 px-8 text-white select-none overflow-hidden"
    >
      {/* Top Header: Caller Details */}
      <div className="flex flex-col items-center mt-6">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
          {call.callType === 'video' ? 'FaceTime Video' : 'iPhone Audio'}
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-center truncate max-w-[280px]">
          {call.callerName || 'Unknown Caller'}
        </h2>
        <p className="text-sm text-neutral-300 font-mono mt-1">
          {call.callerPhone}
        </p>

        {/* Large Caller Avatar with Ripple Effect */}
        <div className="relative mt-8">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping [animation-duration:2.5s]" />
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-white/20 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden">
            {call.callerPhoto ? (
              <img src={call.callerPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{call.callerName ? call.callerName[0] : 'U'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center justify-around px-4 my-2 text-neutral-400">
        <div className="flex flex-col items-center gap-1 opacity-70">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px]">Remind Me</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-70">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px]">Message</span>
        </div>
      </div>

      {/* Bottom Accept / Decline Buttons */}
      <div className="flex items-center justify-between px-6 pb-4">
        {/* Decline */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundService.playTap();
              onDecline();
            }}
            className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/40"
          >
            <PhoneOff className="w-8 h-8" />
          </motion.button>
          <span className="text-xs font-medium text-neutral-300">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundService.playTap();
              onAccept();
            }}
            className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40"
          >
            {call.callType === 'video' ? (
              <Video className="w-8 h-8 fill-current" />
            ) : (
              <Phone className="w-8 h-8 fill-current" />
            )}
          </motion.button>
          <span className="text-xs font-medium text-neutral-300">Accept</span>
        </div>
      </div>
    </motion.div>
  );
};
