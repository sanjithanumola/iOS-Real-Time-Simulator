import React from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  Bluetooth,
  Plane,
  Radio,
  Sun,
  Volume2,
  Flashlight,
  Calculator,
  Camera,
  Mic,
  Moon,
  RotateCw,
  X,
  Play,
  Pause
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  wifiEnabled: boolean;
  onToggleWifi: () => void;
  cellularEnabled: boolean;
  onToggleCellular: () => void;
  bluetoothEnabled: boolean;
  onToggleBluetooth: () => void;
  airplaneMode: boolean;
  onToggleAirplane: () => void;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  brightness: number;
  onChangeBrightness: (val: number) => void;
  volume: number;
  onChangeVolume: (val: number) => void;
  onOpenApp: (appId: string) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  wifiEnabled,
  onToggleWifi,
  cellularEnabled,
  onToggleCellular,
  bluetoothEnabled,
  onToggleBluetooth,
  airplaneMode,
  onToggleAirplane,
  flashlightOn,
  onToggleFlashlight,
  brightness,
  onChangeBrightness,
  volume,
  onChangeVolume,
  onOpenApp,
  musicPlaying,
  onToggleMusic,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: -450, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -450, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 z-50 bg-black/50 backdrop-blur-2xl p-5 pt-12 flex flex-col justify-between text-white select-none overflow-hidden"
      onClick={onClose}
    >
      <div
        className="w-full flex flex-col gap-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-white/70">Control Center</span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top 2x2 Grid: Connectivity & Media Card */}
        <div className="grid grid-cols-2 gap-3">
          {/* Connectivity Box (4 icons) */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-3 grid grid-cols-2 gap-2 border border-white/10 shadow-lg">
            {/* Airplane */}
            <button
              onClick={() => {
                soundService.playTap();
                onToggleAirplane();
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                airplaneMode ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Plane className="w-5 h-5" />
            </button>

            {/* Cellular */}
            <button
              onClick={() => {
                soundService.playTap();
                onToggleCellular();
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                cellularEnabled ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Radio className="w-5 h-5" />
            </button>

            {/* Wi-Fi */}
            <button
              onClick={() => {
                soundService.playTap();
                onToggleWifi();
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                wifiEnabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </button>

            {/* Bluetooth */}
            <button
              onClick={() => {
                soundService.playTap();
                onToggleBluetooth();
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                bluetoothEnabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Bluetooth className="w-5 h-5" />
            </button>
          </div>

          {/* Media Player Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-3.5 border border-white/10 shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/80 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">Apple Music</p>
                <p className="text-[10px] text-white/60 truncate">Now Playing</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-1">
              <button
                onClick={() => {
                  soundService.playTap();
                  onToggleMusic();
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                {musicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Sliders & Quick Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {/* Orientation Lock */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl h-16 flex items-center justify-center border border-white/10">
            <RotateCw className="w-6 h-6 text-white/80" />
          </div>

          {/* Focus / Moon */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl h-16 flex items-center justify-center border border-white/10">
            <Moon className="w-6 h-6 text-indigo-300" />
          </div>

          {/* Brightness Slider */}
          <div className="relative bg-white/15 backdrop-blur-md rounded-2xl h-36 flex flex-col justify-end p-2 border border-white/10 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-white/80 rounded-2xl transition-all"
              style={{ height: `${brightness}%` }}
            />
            <div className="relative z-10 w-full flex justify-center mb-1">
              <Sun className={`w-5 h-5 ${brightness > 40 ? 'text-neutral-900' : 'text-white'}`} />
            </div>
          </div>

          {/* Volume Slider */}
          <div className="relative bg-white/15 backdrop-blur-md rounded-2xl h-36 flex flex-col justify-end p-2 border border-white/10 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-white/80 rounded-2xl transition-all"
              style={{ height: `${volume}%` }}
            />
            <div className="relative z-10 w-full flex justify-center mb-1">
              <Volume2 className={`w-5 h-5 ${volume > 40 ? 'text-neutral-900' : 'text-white'}`} />
            </div>
          </div>
        </div>

        {/* Bottom Utility Row */}
        <div className="grid grid-cols-4 gap-3 -mt-16">
          {/* Flashlight */}
          <button
            onClick={() => {
              soundService.playTap();
              onToggleFlashlight();
            }}
            className={`h-16 rounded-2xl flex items-center justify-center border border-white/10 transition-all ${
              flashlightOn ? 'bg-white text-neutral-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Flashlight className="w-6 h-6" />
          </button>

          {/* Calculator */}
          <button
            onClick={() => {
              soundService.playTap();
              onClose();
              onOpenApp('calculator');
            }}
            className="h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 text-white transition-all"
          >
            <Calculator className="w-6 h-6" />
          </button>

          {/* Camera */}
          <button
            onClick={() => {
              soundService.playTap();
              onClose();
              onOpenApp('camera');
            }}
            className="h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 text-white transition-all"
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* Voice Memo */}
          <button
            onClick={() => {
              soundService.playTap();
              onClose();
              onOpenApp('voicememos');
            }}
            className="h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 text-white transition-all"
          >
            <Mic className="w-6 h-6 text-red-400" />
          </button>
        </div>
      </div>

      {/* Swipe handle */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-28 h-1 bg-white/60 rounded-full" />
      </div>
    </motion.div>
  );
};
