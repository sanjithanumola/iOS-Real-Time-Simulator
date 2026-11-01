import React from 'react';
import {
  Smartphone,
  Copy,
  Check,
  SplitSquareVertical,
  Volume2,
  VolumeX,
  Lock,
  Moon,
  Sun,
  Palette,
  ExternalLink,
  Users
} from 'lucide-react';
import { SimulatorUser, DeviceSettings } from '../../types/ios';
import { soundService } from '../../services/soundService';

interface SimulatorControlsProps {
  currentUser: SimulatorUser | null;
  deviceSettings: DeviceSettings;
  onUpdateSettings: (updates: Partial<DeviceSettings>) => void;
  onPowerButton: () => void;
  onToggleDualPhone: () => void;
  isDualPhoneMode: boolean;
  onOpenDirectoryModal: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  currentUser,
  deviceSettings,
  onUpdateSettings,
  onPowerButton,
  onToggleDualPhone,
  isDualPhoneMode,
  onOpenDirectoryModal,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPhone = () => {
    if (!currentUser?.phoneNumber) return;
    navigator.clipboard.writeText(currentUser.phoneNumber);
    soundService.playTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deviceFinishes = [
    { id: 'natural', name: 'Natural Titanium', color: '#9e9d99' },
    { id: 'desert', name: 'Desert Titanium', color: '#c2a68c' },
    { id: 'white', name: 'White Titanium', color: '#e2e2e5' },
    { id: 'black', name: 'Black Titanium', color: '#2b2b2d' },
  ] as const;

  return (
    <header className="w-full bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white text-xs z-50 shadow-md">
      {/* Left: Simulator Brand & Current Phone Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-200 to-neutral-400 flex items-center justify-center shadow text-black font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              iPhone Simulator
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono font-medium">
                iOS 18.2
              </span>
            </span>
          </div>
        </div>

        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 bg-neutral-800/80 px-2.5 py-1 rounded-xl border border-neutral-700/80">
            <span className="text-neutral-400 text-[11px]">Your Identity:</span>
            <span className="font-mono font-bold text-blue-400 text-xs">
              {currentUser.phoneNumber}
            </span>
            <button
              onClick={handleCopyPhone}
              title="Copy Simulated Phone Number"
              className="p-1 hover:text-blue-300 text-neutral-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Chassis Finish, Dual Phone Testing, Directory, Power Button */}
      <div className="flex items-center gap-2.5">
        {/* Users Directory */}
        <button
          onClick={onOpenDirectoryModal}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-700 font-medium transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Users</span>
        </button>

        {/* Dual Phone Mode Toggle */}
        <button
          onClick={onToggleDualPhone}
          title="Toggle Split-Screen 2-Phone Mode to test calling between 2 devices on one screen"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isDualPhoneMode
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span className="font-medium">Dual Phone Testing</span>
        </button>

        {/* Device Finish Picker */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-xl border border-neutral-700">
          <Palette className="w-3.5 h-3.5 text-neutral-400 mr-1" />
          {deviceFinishes.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundService.playTap();
                onUpdateSettings({ deviceColor: f.id });
              }}
              title={f.name}
              className={`w-4 h-4 rounded-full border transition-all ${
                deviceSettings.deviceColor === f.id ? 'scale-125 border-white ring-2 ring-white/30' : 'border-neutral-600 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: f.color }}
            />
          ))}
        </div>

        {/* Mute/Silent Switch */}
        <button
          onClick={() => {
            soundService.playTap();
            onUpdateSettings({ isSilent: !deviceSettings.isSilent });
          }}
          title={deviceSettings.isSilent ? 'Unmute' : 'Silent Mode'}
          className={`p-1.5 rounded-xl border transition-colors ${
            deviceSettings.isSilent ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          {deviceSettings.isSilent ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Hardware Power / Lock Button */}
        <button
          onClick={onPowerButton}
          title="Hardware Power / Lock"
          className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1.5 rounded-xl border border-neutral-700"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
};
