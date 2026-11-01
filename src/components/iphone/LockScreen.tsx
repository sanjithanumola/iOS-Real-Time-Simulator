import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, Flashlight, Camera, ChevronUp, Bell } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { NotificationItem } from '../../types/ios';

interface LockScreenProps {
  onUnlock: () => void;
  onOpenApp: (appId: 'camera' | 'messages') => void;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  notifications: NotificationItem[];
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  onOpenApp,
  flashlightOn,
  onToggleFlashlight,
  notifications,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');
  const [dateStr, setDateStr] = useState('Sunday, November 1');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setTimeStr(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      setDateStr(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockSwipe = () => {
    soundService.playTap();
    setIsUnlocked(true);
    setTimeout(() => {
      onUnlock();
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -200 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 flex flex-col justify-between pt-14 pb-8 px-6 text-white select-none backdrop-blur-[2px]"
    >
      {/* Top: Lock Icon & Date / Time */}
      <div className="flex flex-col items-center mt-4">
        <motion.div
          animate={{ scale: isUnlocked ? 1.1 : 1 }}
          className="mb-2 text-white/80"
        >
          {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
        </motion.div>

        <p className="text-base font-medium tracking-wide text-white/90 drop-shadow-md">
          {dateStr}
        </p>

        <h1 className="text-7xl font-extrabold tracking-tight font-sans drop-shadow-lg text-white/95 mt-1">
          {timeStr}
        </h1>
      </div>

      {/* Middle: Notification Stack */}
      <div className="flex-1 my-6 overflow-y-auto space-y-2 max-h-[220px] scrollbar-none px-1">
        {notifications.slice(0, 3).map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              handleUnlockSwipe();
              onOpenApp(notif.appId as 'camera' | 'messages');
            }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-lg cursor-pointer hover:bg-black/50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span className="font-semibold text-white/90 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                {notif.appName}
              </span>
              <span>{notif.time}</span>
            </div>
            <p className="text-xs font-semibold text-white">{notif.title}</p>
            <p className="text-xs text-white/80 line-clamp-1">{notif.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom: Flashlight, Camera & Unlock Swipe Bar */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-full flex items-center justify-between px-4">
          {/* Flashlight button */}
          <button
            onClick={() => {
              soundService.playTap();
              onToggleFlashlight();
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg transition-all active:scale-95 ${
              flashlightOn ? 'bg-white text-neutral-900 shadow-white/30' : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Flashlight className="w-5 h-5" />
          </button>

          {/* Camera button */}
          <button
            onClick={() => {
              soundService.playTap();
              handleUnlockSwipe();
              onOpenApp('camera');
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 text-white backdrop-blur-xl border border-white/20 shadow-lg hover:bg-black/60 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe up prompt */}
        <div
          onClick={handleUnlockSwipe}
          className="flex flex-col items-center cursor-pointer group"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white/70 group-hover:text-white"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.div>
          <p className="text-[12px] font-medium text-white/80 tracking-wide">
            Swipe up to open
          </p>
          {/* Home indicator bar */}
          <div className="w-32 h-1 bg-white/80 rounded-full mt-2 group-hover:bg-white shadow" />
        </div>
      </div>
    </motion.div>
  );
};
