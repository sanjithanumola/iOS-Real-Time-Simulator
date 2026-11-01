import React, { useState } from 'react';
import { Smartphone, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService, generateSimulatorPhoneNumber } from '../../services/authService';
import { soundService } from '../../services/soundService';

interface AuthScreenProps {
  onSignedIn: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignedIn }) => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sampleNumber] = useState(generateSimulatorPhoneNumber());

  const handleInstantSignIn = async () => {
    soundService.playTap();
    setLoading(true);
    try {
      await authService.signInWithSimulatorPhone(userName || undefined, sampleNumber);
      onSignedIn();
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    soundService.playTap();
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      onSignedIn();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-16 pb-12 px-6 select-none overflow-y-auto">
      {/* Top iOS Setup Assistant Greeting */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-neutral-200 to-neutral-400 flex items-center justify-center text-black mb-4 shadow-xl">
          <Smartphone className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">iPhone Simulator</h1>
        <p className="text-xs text-neutral-400 mt-2 max-w-[260px] leading-relaxed">
          Set up your simulated phone identity to start calling, FaceTime videoing, and iMessaging.
        </p>
      </div>

      {/* Identity Preview Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 my-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>Assigned Simulator Identity</span>
        </div>

        <div className="bg-neutral-950 rounded-2xl p-3 border border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Simulated Number</span>
          <p className="text-lg font-mono font-bold text-white mt-0.5">{sampleNumber}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Ready for WebRTC Audio & Video Calling
          </span>
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 font-medium block mb-1">Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Alex, Sam, Jordan"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleInstantSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
        >
          <span>{loading ? 'Activating SIM...' : 'Set Up & Open iPhone'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border border-neutral-800 transition-colors"
        >
          Sign In with Google Account
        </button>

        <p className="text-[10px] text-neutral-500 text-center leading-tight pt-1">
          Simulated phone numbers are private web simulator identities for browser calling & messaging.
        </p>
      </div>
    </div>
  );
};
