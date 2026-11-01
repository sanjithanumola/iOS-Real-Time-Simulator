import React, { useState, useEffect, useRef } from 'react';
import { Camera, SwitchCamera, Zap, ZapOff, Image as ImageIcon } from 'lucide-react';
import { soundService } from '../../../services/soundService';

interface CameraAppProps {
  onPhotoCaptured?: (photoDataUrl: string) => void;
  onOpenPhotos?: () => void;
}

export const CameraApp: React.FC<CameraAppProps> = ({
  onPhotoCaptured,
  onOpenPhotos,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashOn, setFlashOn] = useState(false);
  const [recentPhoto, setRecentPhoto] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera feed unavailable:', err);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  const handleCapturePhoto = () => {
    soundService.playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);

    // Capture frame from video or fallback canvas
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setRecentPhoto(dataUrl);
        if (onPhotoCaptured) onPhotoCaptured(dataUrl);
        return;
      }
    } catch {}

    // Fallback photo
    const sample = 'https://picsum.photos/seed/' + Date.now() + '/600/800';
    setRecentPhoto(sample);
    if (onPhotoCaptured) onPhotoCaptured(sample);
  };

  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col justify-between pt-12 pb-6 px-4 select-none overflow-hidden">
      {/* Flash Effect Overlay */}
      {isFlashing && <div className="absolute inset-0 bg-white z-50 pointer-events-none" />}

      {/* Top Bar Controls */}
      <div className="relative z-10 flex items-center justify-between px-4 h-12">
        <button
          onClick={() => {
            soundService.playTap();
            setFlashOn(!flashOn);
          }}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
        >
          {flashOn ? <Zap className="w-5 h-5 text-amber-400 fill-current" /> : <ZapOff className="w-5 h-5" />}
        </button>

        <span className="text-xs uppercase tracking-widest text-white/80 font-semibold">Photo</span>

        <button
          onClick={() => {
            soundService.playTap();
            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
          }}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder Video Frame */}
      <div className="relative flex-1 my-2 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-inner flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />
        {/* Reticle guide */}
        <div className="absolute w-24 h-24 border border-amber-400/40 rounded-lg pointer-events-none" />
      </div>

      {/* Bottom Bar: Thumbnail, Shutter Button, Switcher */}
      <div className="relative z-10 flex items-center justify-around px-4 pt-2 pb-2">
        {/* Thumbnail to Photos */}
        <button
          onClick={() => {
            soundService.playTap();
            if (onOpenPhotos) onOpenPhotos();
          }}
          className="w-12 h-12 rounded-xl bg-neutral-800 border-2 border-white/20 overflow-hidden shadow flex items-center justify-center"
        >
          {recentPhoto ? (
            <img src={recentPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-neutral-400" />
          )}
        </button>

        {/* Shutter Button */}
        <button
          onClick={handleCapturePhoto}
          className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-full h-full bg-white rounded-full shadow" />
        </button>

        {/* Camera mode switch */}
        <button
          onClick={() => {
            soundService.playTap();
            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
          }}
          className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-white hover:bg-neutral-700"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
