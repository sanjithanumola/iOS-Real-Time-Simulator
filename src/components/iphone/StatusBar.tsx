import React, { useEffect, useState } from 'react';
import { Wifi, Battery, BatteryCharging } from 'lucide-react';

interface StatusBarProps {
  isDarkMode?: boolean;
  batteryPercentage?: number;
  isCharging?: boolean;
  carrierName?: string;
  onTapTime?: () => void;
  onSwipeDownRight?: () => void; // Trigger Control Center
  onSwipeDownLeft?: () => void; // Trigger Notification Center
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isDarkMode = true,
  batteryPercentage = 88,
  isCharging = false,
  carrierName = 'SimCell',
  onSwipeDownRight,
  onSwipeDownLeft,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      // Format 12-hour or 24-hour style
      const formattedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTimeStr(`${hours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const textColor = isDarkMode ? 'text-white' : 'text-neutral-900';

  return (
    <div
      className={`relative z-40 w-full h-11 px-7 flex items-center justify-between text-xs font-semibold select-none ${textColor}`}
    >
      {/* Left side: Time & Notification Drag Zone */}
      <div
        className="flex items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity"
        onClick={onSwipeDownLeft}
        title="Tap or drag for Notification Center"
      >
        <span className="font-semibold text-sm tracking-tight">{timeStr}</span>
        <span className="text-[10px] opacity-70 hidden sm:inline">{carrierName}</span>
      </div>

      {/* Center spacer for Dynamic Island */}
      <div className="w-28" />

      {/* Right side: 5G, Wi-Fi, Battery & Control Center Drag Zone */}
      <div
        className="flex items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity"
        onClick={onSwipeDownRight}
        title="Tap or drag for Control Center"
      >
        {/* Signal Bars */}
        <div className="flex items-end gap-[1.5px] h-3">
          <div className="w-[3px] h-1.5 bg-current rounded-xs" />
          <div className="w-[3px] h-2 bg-current rounded-xs" />
          <div className="w-[3px] h-2.5 bg-current rounded-xs" />
          <div className="w-[3px] h-3 bg-current rounded-xs" />
        </div>
        <span className="text-[10px] font-bold">5G</span>

        {/* Wi-Fi */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />

        {/* Battery Container */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">{batteryPercentage}%</span>
          <div className="relative w-5 h-2.5 rounded-[4px] border border-current p-[1px] flex items-center">
            <div
              className={`h-full rounded-[2px] transition-all ${
                batteryPercentage < 20 ? 'bg-red-500' : isCharging ? 'bg-emerald-400' : 'bg-current'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, batteryPercentage))}%` }}
            />
            {/* Battery Terminal Tip */}
            <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1 bg-current rounded-r-xs" />
          </div>
          {isCharging && <BatteryCharging className="w-3 h-3 text-emerald-400 ml-0.5" />}
        </div>
      </div>
    </div>
  );
};
