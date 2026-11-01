import React, { useEffect, useState } from 'react';
import { X, Phone, Video, MessageCircle, Copy, Check, Users, ExternalLink, RefreshCw } from 'lucide-react';
import { SimulatorUser } from '../../types/ios';
import { authService } from '../../services/authService';
import { soundService } from '../../services/soundService';

interface ActiveUsersDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SimulatorUser;
  onStartCall: (phone: string, name: string, isVideo: boolean) => void;
  onStartMessage: (phone: string, name: string) => void;
}

export const ActiveUsersDirectoryModal: React.FC<ActiveUsersDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartCall,
  onStartMessage,
}) => {
  const [users, setUsers] = useState<SimulatorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const list = await authService.getAllUsers(currentUser.uid);
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    soundService.playTap();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold">Simulator User Directory</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Explain info */}
        <div className="bg-neutral-800/60 rounded-2xl p-3 my-3 text-xs text-neutral-300">
          <p className="font-medium text-white mb-1">Real-Time Multi-User Simulator</p>
          <p className="leading-relaxed">
            All registered users are connected to Firebase Firestore. Tap any user to start a live WebRTC audio or FaceTime video call, or send an iMessage!
          </p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800 my-1 pr-1">
          {users.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              <p>No other users online right now.</p>
              <p className="text-neutral-500 mt-1">
                Open this app in an incognito window or turn on "Dual Phone Testing" to test calling between 2 phones!
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.uid} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-sm text-white overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.displayName[0]}</span>
                      )}
                    </div>
                    {/* Online status indicator */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neutral-900 ${
                        user.isOnline ? 'bg-emerald-500' : 'bg-neutral-500'
                      }`}
                    />
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold truncate">{user.displayName}</span>
                      {user.isOnline && (
                        <span className="text-[10px] text-emerald-400 font-mono">online</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">{user.phoneNumber}</p>
                  </div>
                </div>

                {/* Actions: Call, Video, Message */}
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <button
                    onClick={() => {
                      soundService.playTap();
                      onClose();
                      onStartCall(user.phoneNumber, user.displayName, false);
                    }}
                    title="Audio Call"
                    className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => {
                      soundService.playTap();
                      onClose();
                      onStartCall(user.phoneNumber, user.displayName, true);
                    }}
                    title="FaceTime Video Call"
                    className="w-8 h-8 rounded-full bg-green-600/30 text-green-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Video className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => {
                      soundService.playTap();
                      onClose();
                      onStartMessage(user.phoneNumber, user.displayName);
                    }}
                    title="iMessage"
                    className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => handleCopy(user.uid, user.phoneNumber)}
                    title="Copy Phone Number"
                    className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    {copiedId === user.uid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Open new tab helper */}
        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-xs">
          <span className="text-neutral-400">Share phone number to connect</span>
          <button
            onClick={() => {
              window.open(window.location.href, '_blank');
            }}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>Open in New Window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
