import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Mic, Volume2, Music, Check, Bell, BellOff, Zap } from 'lucide-react';
import { CallSession } from '../../types/ios';
import { soundService } from '../../services/soundService';

interface DynamicIslandProps {
  activeCall: CallSession | null;
  callDuration: number;
  onEndCall?: () => void;
  onOpenCallApp?: () => void;
  musicPlaying?: boolean;
  currentSong?: { title: string; artist: string };
  islandAlert?: { type: 'silent' | 'charging' | 'notice'; text: string } | null;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeCall,
  callDuration,
  onEndCall,
  onOpenCallApp,
  musicPlaying,
  currentSong,
  islandAlert,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasActivity = !!activeCall || !!musicPlaying || !!islandAlert;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
      <motion.div
        layout
        onClick={() => {
          soundService.playTap();
          setIsExpanded(!isExpanded);
          if (activeCall && !isExpanded && onOpenCallApp) {
            onOpenCallApp();
          }
        }}
        initial={{ width: 120, height: 32, borderRadius: 20 }}
        animate={{
          width: isExpanded
            ? (activeCall ? 320 : 280)
            : hasActivity
            ? (activeCall ? 190 : 160)
            : 120,
          height: isExpanded ? (activeCall ? 90 : 70) : 32,
          borderRadius: isExpanded ? 30 : 20,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-black text-white px-3 flex items-center justify-between shadow-2xl cursor-pointer select-none border border-neutral-800/40 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* Expanded Call State */}
          {isExpanded && activeCall ? (
            <motion.div
              key="expanded-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-lg border border-emerald-500/30">
                  {activeCall.callerName ? activeCall.callerName[0] : 'P'}
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium">
                    {activeCall.callType === 'video' ? 'FaceTime Call' : 'iPhone Audio'}
                  </p>
                  <p className="text-sm font-semibold text-white truncate max-w-[130px]">
                    {activeCall.callerName || activeCall.receiverName}
                  </p>
                  <p className="text-xs text-emerald-400 font-mono">
                    {formatDuration(callDuration)}
                  </p>
                </div>
              </div>

              {/* End Call Button */}
              {onEndCall && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundService.playTap();
                    onEndCall();
                    setIsExpanded(false);
                  }}
                  className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-lg"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ) : isExpanded && musicPlaying ? (
            /* Expanded Music State */
            <motion.div
              key="expanded-music"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {currentSong?.title || 'Apple Music'}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                    {currentSong?.artist || 'Playing Now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          ) : activeCall ? (
            /* Compact Call State */
            <motion.div
              key="compact-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Phone className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span className="text-[11px] font-mono font-medium text-emerald-400">
                  {formatDuration(callDuration)}
                </span>
              </div>

              {/* Live Waveform Indicator */}
              <div className="flex items-center gap-0.5 pr-1">
                <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="w-0.5 h-4 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]"></span>
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.3s]"></span>
              </div>
            </motion.div>
          ) : islandAlert ? (
            /* System Alert in Island */
            <motion.div
              key="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between text-xs px-1"
            >
              {islandAlert.type === 'silent' ? (
                <BellOff className="w-3.5 h-3.5 text-red-400" />
              ) : islandAlert.type === 'charging' ? (
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              ) : (
                <Check className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-[11px] text-neutral-300 font-medium truncate">
                {islandAlert.text}
              </span>
            </motion.div>
          ) : musicPlaying ? (
            /* Compact Music State */
            <motion.div
              key="compact-music"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between"
            >
              <Music className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <div className="flex items-center gap-0.5">
                <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                <span className="w-0.5 h-3.5 bg-rose-400 rounded-full animate-pulse [animation-delay:0.15s]"></span>
                <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:0.3s]"></span>
              </div>
            </motion.div>
          ) : (
            /* Idle Dynamic Island */
            <motion.div
              key="idle"
              className="w-full flex items-center justify-between px-1"
            >
              {/* Front Camera Lens Reflection */}
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950/70" />
              </div>
              {/* FaceID / Proximity Sensor */}
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900/90" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
