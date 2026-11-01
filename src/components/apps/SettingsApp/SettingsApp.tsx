import React, { useState } from 'react';
import {
  User,
  Image as ImageIcon,
  Moon,
  Sun,
  Volume2,
  Battery,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Radio,
  Check
} from 'lucide-react';
import { SimulatorUser, DeviceSettings } from '../../../types/ios';
import { WALLPAPERS } from '../../../constants/wallpapers';
import { soundService } from '../../../services/soundService';

interface SettingsAppProps {
  currentUser: SimulatorUser;
  deviceSettings: DeviceSettings;
  onUpdateSettings: (updates: Partial<DeviceSettings>) => void;
  onSignOut: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentUser,
  deviceSettings,
  onUpdateSettings,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] = useState<'main' | 'wallpaper' | 'about'>('main');

  return (
    <div className="w-full h-full bg-neutral-950 text-white flex flex-col justify-between pt-14 pb-6 px-4 select-none overflow-hidden">
      {/* Main Settings Menu */}
      {activeSection === 'main' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

          {/* Apple ID Profile Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3 shadow">
            <div className="w-13 h-13 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white overflow-hidden shadow">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.displayName[0]}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.displayName}</p>
              <p className="text-xs text-blue-400 font-mono">{currentUser.phoneNumber}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Apple Account, iCloud+ & iMessage</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </div>

          {/* Simulator Identity Banner */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3 text-xs shadow-inner">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              Simulated Phone Number
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Your simulator number <strong className="font-mono text-white">{currentUser.phoneNumber}</strong> is active. You can call and message other registered users in real time using Firebase & WebRTC!
            </p>
          </div>

          {/* Settings Section: Wallpaper & Appearance */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800">
            {/* Wallpaper */}
            <div
              onClick={() => {
                soundService.playTap();
                setActiveSection('wallpaper');
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Wallpaper</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Dark Mode toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  {deviceSettings.isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">Dark Appearance</span>
              </div>
              <input
                type="checkbox"
                checked={deviceSettings.isDarkMode}
                onChange={(e) => {
                  soundService.playTap();
                  onUpdateSettings({ isDarkMode: e.target.checked });
                }}
                className="w-10 h-6 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Settings Section: Battery */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Battery className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-medium">Battery</span>
                <p className="text-[10px] text-neutral-400">100% Maximum Capacity</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {deviceSettings.batteryPercentage}%
            </span>
          </div>

          {/* Settings Section: About */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800">
            <div
              onClick={() => {
                soundService.playTap();
                setActiveSection('about');
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-600 flex items-center justify-center text-white">
                  <Info className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">About</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                <span>iOS 18.2</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              soundService.playTap();
              onSignOut();
            }}
            className="w-full bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Simulator
          </button>
        </div>
      )}

      {/* Wallpaper Picker Sub-Page */}
      {activeSection === 'wallpaper' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                soundService.playTap();
                setActiveSection('main');
              }}
              className="text-blue-500 text-sm font-medium"
            >
              Back
            </button>
            <h1 className="text-xl font-bold">Choose Wallpaper</h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WALLPAPERS.map((wp) => {
              const isSelected = deviceSettings.wallpaperId === wp.id;
              return (
                <div
                  key={wp.id}
                  onClick={() => {
                    soundService.playTap();
                    onUpdateSettings({ wallpaperId: wp.id });
                  }}
                  className={`relative aspect-9/16 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-lg ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                  style={{ background: wp.gradient }}
                >
                  <div className="absolute inset-0 flex flex-col justify-between p-2">
                    <span className="text-[10px] font-bold text-white/90 drop-shadow">{wp.name}</span>
                    {isSelected && (
                      <div className="self-end w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* About Phone Sub-Page */}
      {activeSection === 'about' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                soundService.playTap();
                setActiveSection('main');
              }}
              className="text-blue-500 text-sm font-medium"
            >
              Back
            </button>
            <h1 className="text-xl font-bold">About</h1>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800">
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Name</span>
              <span className="font-semibold text-white">iPhone 16 Pro</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">iOS Version</span>
              <span className="font-semibold text-white">18.2</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Model Name</span>
              <span className="font-semibold text-white">iPhone 16 Pro Max</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Simulated Number</span>
              <span className="font-mono text-blue-400">{currentUser.phoneNumber}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Network Backend</span>
              <span className="font-semibold text-white">Firebase Cloud Firestore</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Audio/Video Engine</span>
              <span className="font-semibold text-white">WebRTC PeerConnection</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
