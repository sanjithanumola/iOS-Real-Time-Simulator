import React from 'react';
import { motion } from 'motion/react';
import { soundService } from '../../services/soundService';

interface IPhoneFrameProps {
  children: React.ReactNode;
  deviceColor?: 'natural' | 'black' | 'white' | 'desert';
  onPowerButton?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onActionButton?: () => void;
  onHomeGesture?: () => void;
  wallpaperGradient: string;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  deviceColor = 'natural',
  onPowerButton,
  onVolumeUp,
  onVolumeDown,
  onActionButton,
  onHomeGesture,
  wallpaperGradient,
}) => {
  // Bezel titanium styles
  const bezelColors = {
    natural: 'from-[#8e8d8a] via-[#bab6b5] to-[#7d7c79] border-[#5a5957]',
    black: 'from-[#2b2b2d] via-[#3a3a3c] to-[#1c1c1e] border-[#1c1c1e]',
    white: 'from-[#d9d9dc] via-[#f0f0f2] to-[#c7c7cb] border-[#b0b0b4]',
    desert: 'from-[#c2a68c] via-[#dfcdb9] to-[#a88c74] border-[#8a6e56]',
  };

  return (
    <div className="relative flex items-center justify-center p-3 select-none">
      {/* Physical Hardware Buttons on External Frame */}
      {/* Left side: Action Button */}
      <div
        onClick={() => {
          soundService.playTap();
          if (onActionButton) onActionButton();
        }}
        title="Action Button (Mute/Unmute)"
        className="absolute -left-[5px] top-[115px] w-[6px] h-9 bg-neutral-400 rounded-l-[3px] cursor-pointer hover:brightness-125 active:translate-x-[2px] transition-all shadow-sm"
      />
      {/* Left side: Volume Up */}
      <div
        onClick={() => {
          soundService.playTap();
          if (onVolumeUp) onVolumeUp();
        }}
        title="Volume Up"
        className="absolute -left-[5px] top-[165px] w-[6px] h-14 bg-neutral-400 rounded-l-[3px] cursor-pointer hover:brightness-125 active:translate-x-[2px] transition-all shadow-sm"
      />
      {/* Left side: Volume Down */}
      <div
        onClick={() => {
          soundService.playTap();
          if (onVolumeDown) onVolumeDown();
        }}
        title="Volume Down"
        className="absolute -left-[5px] top-[230px] w-[6px] h-14 bg-neutral-400 rounded-l-[3px] cursor-pointer hover:brightness-125 active:translate-x-[2px] transition-all shadow-sm"
      />
      {/* Right side: Power / Lock Button */}
      <div
        onClick={() => {
          soundService.playTap();
          if (onPowerButton) onPowerButton();
        }}
        title="Power / Lock Screen"
        className="absolute -right-[5px] top-[180px] w-[6px] h-20 bg-neutral-400 rounded-r-[3px] cursor-pointer hover:brightness-125 active:-translate-x-[2px] transition-all shadow-sm"
      />

      {/* Titanium Outer Rim */}
      <div
        className={`relative w-[390px] h-[812px] sm:w-[400px] sm:h-[830px] rounded-[55px] p-[10px] bg-gradient-to-b ${bezelColors[deviceColor]} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.15)] transition-all`}
      >
        {/* Antenna band accents */}
        <div className="absolute top-[85px] -left-[1px] w-[2px] h-[6px] bg-neutral-600/70" />
        <div className="absolute top-[85px] -right-[1px] w-[2px] h-[6px] bg-neutral-600/70" />
        <div className="absolute bottom-[95px] -left-[1px] w-[2px] h-[6px] bg-neutral-600/70" />
        <div className="absolute bottom-[95px] -right-[1px] w-[2px] h-[6px] bg-neutral-600/70" />

        {/* Inner Black OLED Bezel */}
        <div className="relative w-full h-full bg-black rounded-[46px] p-[5px] shadow-inner overflow-hidden border border-black/80">
          {/* OLED Active Screen Canvas */}
          <div
            className="relative w-full h-full rounded-[42px] overflow-hidden flex flex-col justify-between"
            style={{ background: wallpaperGradient }}
          >
            {/* Main Application & OS Content */}
            {children}

            {/* Bottom Home Indicator Bar (Swipe up gesture / tap to go home) */}
            <div
              onClick={() => {
                soundService.playTap();
                if (onHomeGesture) onHomeGesture();
              }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 py-2 px-6 cursor-pointer group"
              title="Home Bar (Tap to return Home)"
            >
              <div className="w-36 h-1.2 bg-white/70 rounded-full group-hover:bg-white group-active:scale-95 transition-all shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
