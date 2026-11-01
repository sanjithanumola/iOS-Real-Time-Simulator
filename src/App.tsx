import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  SimulatorUser,
  Contact,
  CallLog,
  CallSession,
  Conversation,
  AppId,
  DeviceSettings,
  NotificationItem,
} from './types/ios';
import { authService } from './services/authService';
import { webrtcService, WebRTCService } from './services/webrtcService';
import { ContactsService } from './services/contactsService';
import { MessageService } from './services/messageService';
import { soundService } from './services/soundService';
import { WALLPAPERS } from './constants/wallpapers';

// Frame & OS Components
import { IPhoneFrame } from './components/iphone/IPhoneFrame';
import { DynamicIsland } from './components/iphone/DynamicIsland';
import { StatusBar } from './components/iphone/StatusBar';
import { LockScreen } from './components/iphone/LockScreen';
import { HomeScreen } from './components/iphone/HomeScreen';
import { ControlCenter } from './components/iphone/ControlCenter';
import { IncomingCallModal } from './components/iphone/IncomingCallModal';
import { AuthScreen } from './components/iphone/AuthScreen';

// Native Apps
import { PhoneApp } from './components/apps/PhoneApp/PhoneApp';
import { FaceTimeApp } from './components/apps/FaceTimeApp/FaceTimeApp';
import { MessagesApp } from './components/apps/MessagesApp/MessagesApp';
import { ContactsApp } from './components/apps/ContactsApp/ContactsApp';
import { CameraApp } from './components/apps/CameraApp/CameraApp';
import { PhotosApp } from './components/apps/PhotosApp/PhotosApp';
import { SafariApp } from './components/apps/SafariApp/SafariApp';
import { SettingsApp } from './components/apps/SettingsApp/SettingsApp';
import { ClockApp } from './components/apps/ClockApp/ClockApp';
import { CalculatorApp } from './components/apps/CalculatorApp/CalculatorApp';
import { WeatherApp } from './components/apps/WeatherApp/WeatherApp';
import { NotesApp } from './components/apps/NotesApp/NotesApp';
import { VoiceMemosApp } from './components/apps/VoiceMemosApp/VoiceMemosApp';
import { MusicApp } from './components/apps/MusicApp/MusicApp';
import {
  CalendarApp,
  RemindersApp,
  MapsApp,
  AppStoreApp,
  FilesApp,
} from './components/apps/UtilityApps';

// Simulator Toolbar & Directory
import { SimulatorControls } from './components/simulator/SimulatorControls';
import { ActiveUsersDirectoryModal } from './components/simulator/ActiveUsersDirectoryModal';

export default function App() {
  // Current user & authentication
  const [currentUser, setCurrentUser] = useState<SimulatorUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // OS Navigation State
  const [isLocked, setIsLocked] = useState(false);
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [isDualPhoneMode, setIsDualPhoneMode] = useState(false);

  // Call & WebRTC State
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callDurationTimerRef = useRef<number | null>(null);

  // Data Collections from Firebase
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Music playback state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  });

  // Dynamic Island Alert message
  const [islandAlert, setIslandAlert] = useState<{ type: 'silent' | 'charging' | 'notice'; text: string } | null>(null);

  // Message recipient shortcut
  const [initialRecipientPhone, setInitialRecipientPhone] = useState<string | undefined>();

  // Device settings
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    wallpaperId: 'ios18_default',
    isDarkMode: true,
    isSilent: false,
    volume: 80,
    brightness: 85,
    wifiEnabled: true,
    cellularEnabled: true,
    bluetoothEnabled: true,
    airplaneMode: false,
    flashlightOn: false,
    batteryPercentage: 92,
    lowPowerMode: false,
    deviceColor: 'natural',
  });

  // 1. Initialize Auth State Listener
  useEffect(() => {
    const unsub = authService.onAuthChange((user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // 2. Listen for Incoming Calls
  useEffect(() => {
    if (!currentUser) return;
    const unsub = WebRTCService.listenForIncomingCalls(currentUser.uid, (call: CallSession) => {
      setIncomingCall(call);
      // Also add to notifications stack
      setNotifications((prev) => [
        {
          id: call.id,
          appId: call.callType === 'video' ? 'facetime' : 'phone',
          appName: call.callType === 'video' ? 'FaceTime' : 'Phone',
          title: `Incoming ${call.callType === 'video' ? 'FaceTime' : 'Call'}`,
          body: `${call.callerName} (${call.callerPhone})`,
          time: 'Now',
        },
        ...prev,
      ]);
    });
    return () => unsub();
  }, [currentUser]);

  // 3. Listen for Contacts, Call Logs & Conversations
  useEffect(() => {
    if (!currentUser) return;

    const unsubContacts = ContactsService.listenContacts(currentUser.uid, (cList) => {
      setContacts(cList);
    });

    const unsubLogs = ContactsService.listenCallLogs(currentUser.uid, (logs) => {
      setCallLogs(logs);
    });

    const unsubConvs = MessageService.listenConversations(currentUser.uid, (convs) => {
      setConversations(convs);
    });

    return () => {
      unsubContacts();
      unsubLogs();
      unsubConvs();
    };
  }, [currentUser]);

  // 4. Track Call Duration Timer
  useEffect(() => {
    if (activeCall && activeCall.status === 'accepted') {
      setCallDuration(0);
      callDurationTimerRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current);
        callDurationTimerRef.current = null;
      }
    }
    return () => {
      if (callDurationTimerRef.current) clearInterval(callDurationTimerRef.current);
    };
  }, [activeCall?.status]);

  // Handle Starting a Call (Audio or Video)
  const handleStartCall = async (targetPhone: string, peerName?: string, isVideo = false) => {
    if (!currentUser) return;

    // Search target user by phone in directory
    const peerUser = await authService.findUserByPhone(targetPhone);
    const peerUid = peerUser ? peerUser.uid : 'sim_' + targetPhone.replace(/\D/g, '');
    const finalPeerName = peerUser ? peerUser.displayName : peerName || targetPhone;

    const callType = isVideo ? 'video' : 'audio';

    try {
      const callId = await webrtcService.startCall(
        {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber,
          photoURL: currentUser.photoURL,
        },
        {
          uid: peerUid,
          displayName: finalPeerName,
          phoneNumber: targetPhone,
        },
        callType
      );

      const session: CallSession = {
        id: callId,
        callerId: currentUser.uid,
        callerName: currentUser.displayName,
        callerPhone: currentUser.phoneNumber,
        callerPhoto: currentUser.photoURL,
        receiverId: peerUid,
        receiverName: finalPeerName,
        receiverPhone: targetPhone,
        callType,
        status: 'ringing',
        createdAt: new Date().toISOString(),
      };

      setActiveCall(session);
      setActiveApp(isVideo ? 'facetime' : 'phone');

      // Log outgoing call
      await ContactsService.addCallLog(currentUser.uid, {
        peerId: peerUid,
        peerName: finalPeerName,
        peerPhone: targetPhone,
        direction: 'outgoing',
        callType,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to initiate call:', err);
    }
  };

  // Handle Answering Incoming Call
  const handleAcceptIncomingCall = async () => {
    if (!incomingCall || !currentUser) return;
    const callToAccept = incomingCall;
    setIncomingCall(null);

    await webrtcService.answerCall(callToAccept.id, currentUser.uid, callToAccept.callType);
    setActiveCall({ ...callToAccept, status: 'accepted' });
    setActiveApp(callToAccept.callType === 'video' ? 'facetime' : 'phone');
    setIsLocked(false);

    // Log incoming call
    await ContactsService.addCallLog(currentUser.uid, {
      peerId: callToAccept.callerId,
      peerName: callToAccept.callerName,
      peerPhone: callToAccept.callerPhone,
      direction: 'incoming',
      callType: callToAccept.callType,
      timestamp: new Date().toISOString(),
    });
  };

  // Handle Declining Incoming Call
  const handleDeclineIncomingCall = async () => {
    if (!incomingCall || !currentUser) return;
    const callToDecline = incomingCall;
    setIncomingCall(null);
    await webrtcService.declineCall(callToDecline.id);

    // Log missed call
    await ContactsService.addCallLog(currentUser.uid, {
      peerId: callToDecline.callerId,
      peerName: callToDecline.callerName,
      peerPhone: callToDecline.callerPhone,
      direction: 'missed',
      callType: callToDecline.callType,
      timestamp: new Date().toISOString(),
    });
  };

  // Handle Ending Active Call
  const handleEndCall = async () => {
    await webrtcService.endCall();
    setActiveCall(null);
    setCallDuration(0);
  };

  // Hardware button callbacks
  const handlePowerButton = () => {
    soundService.playLockSound();
    setIsLocked((prev) => !prev);
    setShowControlCenter(false);
  };

  const handleActionButton = () => {
    const newSilent = !deviceSettings.isSilent;
    setDeviceSettings((prev) => ({ ...prev, isSilent: newSilent }));
    soundService.playTap();
    setIslandAlert({
      type: 'silent',
      text: newSilent ? 'Silent Mode On' : 'Silent Mode Off',
    });
    setTimeout(() => setIslandAlert(null), 2500);
  };

  const handleVolumeUp = () => {
    soundService.playTap();
    setDeviceSettings((prev) => ({
      ...prev,
      volume: Math.min(100, prev.volume + 10),
    }));
  };

  const handleVolumeDown = () => {
    soundService.playTap();
    setDeviceSettings((prev) => ({
      ...prev,
      volume: Math.max(0, prev.volume - 10),
    }));
  };

  // Navigate directly to Messages with a phone number
  const handleStartMessage = (phone: string, name?: string) => {
    setInitialRecipientPhone(phone);
    setActiveApp('messages');
    setIsLocked(false);
  };

  // Current selected wallpaper gradient
  const currentWallpaper =
    WALLPAPERS.find((w) => w.id === deviceSettings.wallpaperId)?.gradient ||
    WALLPAPERS[0].gradient;

  // Unread badge counts
  const unreadMessagesCount = conversations.reduce((acc, conv) => {
    if (!currentUser) return acc;
    return acc + (conv.unreadCounts?.[currentUser.uid] || 0);
  }, 0);

  const missedCallsCount = callLogs.filter((l) => l.direction === 'missed').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-start overflow-x-hidden">
      {/* Top Simulator Control Bar */}
      <SimulatorControls
        currentUser={currentUser}
        deviceSettings={deviceSettings}
        onUpdateSettings={(updates) => setDeviceSettings((prev) => ({ ...prev, ...updates }))}
        onPowerButton={handlePowerButton}
        onToggleDualPhone={() => setIsDualPhoneMode(!isDualPhoneMode)}
        isDualPhoneMode={isDualPhoneMode}
        onOpenDirectoryModal={() => setShowDirectoryModal(true)}
      />

      {/* Main Canvas Area */}
      <main className="w-full flex-1 flex flex-wrap items-center justify-center gap-10 py-6 px-4">
        {/* Primary iPhone Device */}
        <div className="flex flex-col items-center">
          <IPhoneFrame
            deviceColor={deviceSettings.deviceColor}
            onPowerButton={handlePowerButton}
            onVolumeUp={handleVolumeUp}
            onVolumeDown={handleVolumeDown}
            onActionButton={handleActionButton}
            onHomeGesture={() => {
              if (activeApp) {
                soundService.playTap();
                setActiveApp(null);
              }
            }}
            wallpaperGradient={currentWallpaper}
          >
            {/* Flashlight screen effect */}
            {deviceSettings.flashlightOn && (
              <div className="absolute inset-0 bg-white/40 z-40 pointer-events-none transition-opacity" />
            )}

            {/* Dynamic Island Header */}
            <DynamicIsland
              activeCall={activeCall}
              callDuration={callDuration}
              onEndCall={handleEndCall}
              onOpenCallApp={() => {
                if (activeCall) {
                  setActiveApp(activeCall.callType === 'video' ? 'facetime' : 'phone');
                }
              }}
              musicPlaying={musicPlaying}
              currentSong={currentSong}
              islandAlert={islandAlert}
            />

            {/* Status Bar */}
            <StatusBar
              isDarkMode={deviceSettings.isDarkMode}
              batteryPercentage={deviceSettings.batteryPercentage}
              isCharging={false}
              carrierName="SimCell 5G"
              onSwipeDownRight={() => setShowControlCenter(true)}
              onSwipeDownLeft={() => setIsLocked(true)}
            />

            {/* Application Screen Routing */}
            <div className="relative w-full flex-1 overflow-hidden">
              {!currentUser && authChecked ? (
                /* Initial Setup / Identity Assignment */
                <AuthScreen onSignedIn={() => {}} />
              ) : isLocked ? (
                /* Lock Screen */
                <LockScreen
                  onUnlock={() => setIsLocked(false)}
                  onOpenApp={(appId) => {
                    setIsLocked(false);
                    setActiveApp(appId);
                  }}
                  flashlightOn={deviceSettings.flashlightOn}
                  onToggleFlashlight={() =>
                    setDeviceSettings((p) => ({ ...p, flashlightOn: !p.flashlightOn }))
                  }
                  notifications={notifications}
                />
              ) : activeApp ? (
                /* Active Opened Application */
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeApp}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    {activeApp === 'phone' && (
                      <PhoneApp
                        currentUser={currentUser!}
                        contacts={contacts}
                        callLogs={callLogs}
                        activeCall={activeCall}
                        callDuration={callDuration}
                        onStartCall={(phone, name, isVideo) => handleStartCall(phone, name, isVideo)}
                        onEndCall={handleEndCall}
                        onAddContactFromNumber={(phone) => {
                          setActiveApp('contacts');
                        }}
                      />
                    )}
                    {activeApp === 'facetime' && (
                      <FaceTimeApp
                        currentUser={currentUser!}
                        contacts={contacts}
                        activeCall={activeCall}
                        callDuration={callDuration}
                        onStartFaceTimeCall={(phone, name) => handleStartCall(phone, name, true)}
                        onEndCall={handleEndCall}
                      />
                    )}
                    {activeApp === 'messages' && (
                      <MessagesApp
                        currentUser={currentUser!}
                        contacts={contacts}
                        conversations={conversations}
                        onStartAudioCall={(phone, name) => handleStartCall(phone, name, false)}
                        onStartVideoCall={(phone, name) => handleStartCall(phone, name, true)}
                        initialRecipientPhone={initialRecipientPhone}
                      />
                    )}
                    {activeApp === 'contacts' && (
                      <ContactsApp
                        currentUser={currentUser!}
                        contacts={contacts}
                        onStartAudioCall={(phone, name) => handleStartCall(phone, name, false)}
                        onStartVideoCall={(phone, name) => handleStartCall(phone, name, true)}
                        onStartMessage={(phone, name) => handleStartMessage(phone, name)}
                      />
                    )}
                    {activeApp === 'camera' && (
                      <CameraApp
                        onPhotoCaptured={(dataUrl) => {
                          setCapturedPhotos((prev) => [dataUrl, ...prev]);
                        }}
                        onOpenPhotos={() => setActiveApp('photos')}
                      />
                    )}
                    {activeApp === 'photos' && (
                      <PhotosApp
                        capturedPhotos={capturedPhotos}
                        onDeletePhoto={(url) => {
                          setCapturedPhotos((prev) => prev.filter((p) => p !== url));
                        }}
                      />
                    )}
                    {activeApp === 'safari' && <SafariApp />}
                    {activeApp === 'settings' && (
                      <SettingsApp
                        currentUser={currentUser!}
                        deviceSettings={deviceSettings}
                        onUpdateSettings={(updates) =>
                          setDeviceSettings((prev) => ({ ...prev, ...updates }))
                        }
                        onSignOut={async () => {
                          await authService.signOut();
                          setCurrentUser(null);
                        }}
                      />
                    )}
                    {activeApp === 'clock' && <ClockApp />}
                    {activeApp === 'calculator' && <CalculatorApp />}
                    {activeApp === 'weather' && <WeatherApp />}
                    {activeApp === 'notes' && <NotesApp />}
                    {activeApp === 'voicememos' && <VoiceMemosApp />}
                    {activeApp === 'music' && (
                      <MusicApp
                        isPlaying={musicPlaying}
                        onTogglePlay={() => setMusicPlaying(!musicPlaying)}
                        currentSong={currentSong}
                      />
                    )}
                    {activeApp === 'calendar' && <CalendarApp />}
                    {activeApp === 'reminders' && <RemindersApp />}
                    {activeApp === 'maps' && <MapsApp />}
                    {activeApp === 'appstore' && <AppStoreApp />}
                    {activeApp === 'files' && <FilesApp />}
                  </motion.div>
                </AnimatePresence>
              ) : (
                /* iOS Home Screen */
                <HomeScreen
                  onOpenApp={(appId) => setActiveApp(appId)}
                  unreadMessagesCount={unreadMessagesCount}
                  missedCallsCount={missedCallsCount}
                />
              )}
            </div>

            {/* Control Center Overlay */}
            <ControlCenter
              isOpen={showControlCenter}
              onClose={() => setShowControlCenter(false)}
              wifiEnabled={deviceSettings.wifiEnabled}
              onToggleWifi={() =>
                setDeviceSettings((p) => ({ ...p, wifiEnabled: !p.wifiEnabled }))
              }
              cellularEnabled={deviceSettings.cellularEnabled}
              onToggleCellular={() =>
                setDeviceSettings((p) => ({ ...p, cellularEnabled: !p.cellularEnabled }))
              }
              bluetoothEnabled={deviceSettings.bluetoothEnabled}
              onToggleBluetooth={() =>
                setDeviceSettings((p) => ({ ...p, bluetoothEnabled: !p.bluetoothEnabled }))
              }
              airplaneMode={deviceSettings.airplaneMode}
              onToggleAirplane={() =>
                setDeviceSettings((p) => ({ ...p, airplaneMode: !p.airplaneMode }))
              }
              flashlightOn={deviceSettings.flashlightOn}
              onToggleFlashlight={() =>
                setDeviceSettings((p) => ({ ...p, flashlightOn: !p.flashlightOn }))
              }
              brightness={deviceSettings.brightness}
              onChangeBrightness={(b) => setDeviceSettings((p) => ({ ...p, brightness: b }))}
              volume={deviceSettings.volume}
              onChangeVolume={(v) => setDeviceSettings((p) => ({ ...p, volume: v }))}
              onOpenApp={(appId) => {
                setShowControlCenter(false);
                setActiveApp(appId as AppId);
              }}
              musicPlaying={musicPlaying}
              onToggleMusic={() => setMusicPlaying(!musicPlaying)}
            />

            {/* Full Screen Incoming Call Screen */}
            <AnimatePresence>
              {incomingCall && (
                <IncomingCallModal
                  call={incomingCall}
                  onAccept={handleAcceptIncomingCall}
                  onDecline={handleDeclineIncomingCall}
                />
              )}
            </AnimatePresence>
          </IPhoneFrame>
        </div>

        {/* Dual Phone Mode: Embedded Test Peer Frame */}
        {isDualPhoneMode && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-2 text-center">
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-medium">
                Dual Phone Testing Peer (Simulated iPhone 2)
              </span>
            </div>
            {/* Embedded peer iframe pointing to the app so user can test real 2-way call immediately */}
            <div className="relative w-[390px] h-[812px] sm:w-[400px] sm:h-[830px] rounded-[55px] p-[10px] bg-gradient-to-b from-[#2b2b2d] via-[#3a3a3c] to-[#1c1c1e] shadow-2xl border border-neutral-700">
              <iframe
                src={window.location.href}
                className="w-full h-full rounded-[44px] border-none bg-black"
                title="Secondary iPhone Peer"
              />
            </div>
          </div>
        )}
      </main>

      {/* Active Users Directory Modal */}
      {currentUser && (
        <ActiveUsersDirectoryModal
          isOpen={showDirectoryModal}
          onClose={() => setShowDirectoryModal(false)}
          currentUser={currentUser}
          onStartCall={(phone, name, isVideo) => handleStartCall(phone, name, isVideo)}
          onStartMessage={(phone, name) => handleStartMessage(phone, name)}
        />
      )}
    </div>
  );
}
