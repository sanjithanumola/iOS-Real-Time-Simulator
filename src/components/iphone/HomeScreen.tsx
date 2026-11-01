import React from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Video,
  Users,
  Camera,
  Image,
  Compass,
  Settings,
  Clock,
  Calculator,
  CloudSun,
  FileText,
  Mic,
  Music,
  Calendar,
  CheckSquare,
  MapPin,
  ShoppingBag,
  Folder,
  Search
} from 'lucide-react';
import { AppId, AppMetadata } from '../../types/ios';
import { soundService } from '../../services/soundService';

interface HomeScreenProps {
  onOpenApp: (appId: AppId) => void;
  unreadMessagesCount: number;
  missedCallsCount: number;
}

export const APPS: AppMetadata[] = [
  { id: 'phone', name: 'Phone', icon: 'Phone', gradient: 'from-emerald-400 to-green-600', isDock: true },
  { id: 'messages', name: 'Messages', icon: 'MessageCircle', gradient: 'from-emerald-400 to-green-500', isDock: true },
  { id: 'facetime', name: 'FaceTime', icon: 'Video', gradient: 'from-green-400 to-emerald-600' },
  { id: 'contacts', name: 'Contacts', icon: 'Users', gradient: 'from-neutral-400 to-neutral-600' },
  { id: 'camera', name: 'Camera', icon: 'Camera', gradient: 'from-neutral-600 to-neutral-800' },
  { id: 'photos', name: 'Photos', icon: 'Image', gradient: 'from-amber-300 via-rose-400 to-blue-500' },
  { id: 'safari', name: 'Safari', icon: 'Compass', gradient: 'from-blue-400 to-blue-600', isDock: true },
  { id: 'settings', name: 'Settings', icon: 'Settings', gradient: 'from-neutral-400 to-neutral-600' },
  { id: 'clock', name: 'Clock', icon: 'Clock', gradient: 'from-neutral-800 to-black' },
  { id: 'calculator', name: 'Calculator', icon: 'Calculator', gradient: 'from-neutral-800 to-neutral-900' },
  { id: 'weather', name: 'Weather', icon: 'CloudSun', gradient: 'from-sky-400 to-blue-600' },
  { id: 'notes', name: 'Notes', icon: 'FileText', gradient: 'from-amber-200 to-yellow-400' },
  { id: 'voicememos', name: 'Voice Memos', icon: 'Mic', gradient: 'from-red-500 to-rose-700' },
  { id: 'music', name: 'Music', icon: 'Music', gradient: 'from-pink-500 to-rose-600', isDock: true },
  { id: 'calendar', name: 'Calendar', icon: 'Calendar', gradient: 'from-red-500 to-red-600' },
  { id: 'reminders', name: 'Reminders', icon: 'CheckSquare', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'maps', name: 'Maps', icon: 'MapPin', gradient: 'from-teal-400 to-emerald-600' },
  { id: 'appstore', name: 'App Store', icon: 'ShoppingBag', gradient: 'from-blue-500 to-indigo-700' },
  { id: 'files', name: 'Files', icon: 'Folder', gradient: 'from-sky-400 to-blue-500' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenApp,
  unreadMessagesCount,
  missedCallsCount,
}) => {
  const renderAppIcon = (app: AppMetadata) => {
    const iconProps = { className: 'w-6 h-6 text-white stroke-[2.2]' };

    switch (app.id) {
      case 'phone': return <Phone {...iconProps} className="w-6 h-6 text-white fill-white" />;
      case 'messages': return <MessageCircle {...iconProps} className="w-6 h-6 text-white fill-white" />;
      case 'facetime': return <Video {...iconProps} className="w-6 h-6 text-white fill-white" />;
      case 'contacts': return <Users {...iconProps} />;
      case 'camera': return <Camera {...iconProps} />;
      case 'photos': return <Image {...iconProps} />;
      case 'safari': return <Compass {...iconProps} />;
      case 'settings': return <Settings {...iconProps} />;
      case 'clock': return <Clock {...iconProps} />;
      case 'calculator': return <Calculator {...iconProps} />;
      case 'weather': return <CloudSun {...iconProps} />;
      case 'notes': return <FileText {...iconProps} className="text-neutral-800" />;
      case 'voicememos': return <Mic {...iconProps} />;
      case 'music': return <Music {...iconProps} className="fill-white" />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'reminders': return <CheckSquare {...iconProps} />;
      case 'maps': return <MapPin {...iconProps} />;
      case 'appstore': return <ShoppingBag {...iconProps} />;
      case 'files': return <Folder {...iconProps} />;
      default: return <Settings {...iconProps} />;
    }
  };

  const getBadge = (appId: AppId) => {
    if (appId === 'messages' && unreadMessagesCount > 0) {
      return unreadMessagesCount;
    }
    if (appId === 'phone' && missedCallsCount > 0) {
      return missedCallsCount;
    }
    return 0;
  };

  const gridApps = APPS.filter(a => !a.isDock);
  const dockApps = APPS.filter(a => a.isDock);

  return (
    <div className="relative w-full h-full pt-14 pb-5 px-5 flex flex-col justify-between select-none">
      {/* Home Screen App Grid */}
      <div className="grid grid-cols-4 gap-y-4 gap-x-3.5 px-1 justify-items-center">
        {gridApps.map((app) => {
          const badge = getBadge(app.id);
          return (
            <motion.div
              key={app.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                soundService.playTap();
                onOpenApp(app.id);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div
                className={`relative w-[54px] h-[54px] rounded-[14px] bg-gradient-to-tr ${app.gradient} flex items-center justify-center shadow-md border border-white/20 group-hover:brightness-105 transition-all`}
              >
                {renderAppIcon(app)}

                {/* Notification Badge */}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow border-2 border-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-white tracking-tight drop-shadow-md text-center truncate max-w-[62px]">
                {app.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Area: Search Pill, Page Dots & Dock */}
      <div className="flex flex-col items-center gap-2">
        {/* Search Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full text-white/80 shadow text-xs">
          <Search className="w-3 h-3 text-white/70" />
          <span className="text-[11px] font-medium">Search</span>
        </div>

        {/* Page Dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Dock Bar */}
        <div className="w-full bg-white/20 backdrop-blur-2xl rounded-[28px] p-2.5 px-4 flex items-center justify-between border border-white/20 shadow-2xl">
          {dockApps.map((app) => {
            const badge = getBadge(app.id);
            return (
              <motion.div
                key={app.id}
                whileTap={{ scale: 0.86 }}
                onClick={() => {
                  soundService.playTap();
                  onOpenApp(app.id);
                }}
                className="relative cursor-pointer group"
              >
                <div
                  className={`w-[54px] h-[54px] rounded-[14px] bg-gradient-to-tr ${app.gradient} flex items-center justify-center shadow-lg border border-white/20 group-hover:brightness-105 transition-all`}
                >
                  {renderAppIcon(app)}
                </div>

                {/* Badge on Dock */}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow border-2 border-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
