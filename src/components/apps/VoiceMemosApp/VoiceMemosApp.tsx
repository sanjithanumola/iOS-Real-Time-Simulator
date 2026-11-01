import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Trash2, Square } from 'lucide-react';
import { soundService } from '../../../services/soundService';

interface Memo {
  id: string;
  name: string;
  duration: string;
  date: string;
  audioUrl?: string;
}

export const VoiceMemosApp: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [memos, setMemos] = useState<Memo[]>([
    { id: '1', name: 'New Recording 1', duration: '0:14', date: 'Yesterday' },
    { id: '2', name: 'Meeting Notes', duration: '1:08', date: '3 days ago' },
  ]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  const startRecording = () => {
    soundService.playTap();
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    soundService.playTap();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const m = Math.floor(recordSeconds / 60);
    const s = recordSeconds % 60;
    const dur = `${m}:${s < 10 ? '0' : ''}${s}`;

    setMemos([
      {
        id: Date.now().toString(),
        name: `New Recording ${memos.length + 1}`,
        duration: dur || '0:03',
        date: 'Today',
      },
      ...memos,
    ]);
  };

  const togglePlay = (id: string) => {
    soundService.playTap();
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-6 px-4 select-none overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Voice Memos</h1>

        {/* Live waveform visualization during recording */}
        {isRecording && (
          <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-4 my-3 flex flex-col items-center">
            <span className="text-3xl font-mono text-red-500 mb-2">{formatTimer(recordSeconds)}</span>
            <div className="flex items-center gap-1 h-12 w-full justify-center">
              {[40, 75, 20, 90, 60, 30, 85, 45, 100, 35, 70, 50, 80, 25].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Memos List */}
        <div className="divide-y divide-neutral-800">
          {memos.map((memo) => (
            <div
              key={memo.id}
              onClick={() => togglePlay(memo.id)}
              className="py-3 px-2 flex items-center justify-between hover:bg-neutral-900/60 rounded-xl cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-white">{memo.name}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                  <span>{memo.date}</span>
                  <span>•</span>
                  <span>{memo.duration}</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                {playingId === memo.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Shutter Button */}
      <div className="flex justify-center pt-2">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full border-4 border-red-500/40 p-1 flex items-center justify-center shadow-lg"
          >
            <div className="w-7 h-7 bg-red-600 rounded-md" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full border-4 border-white/40 p-1 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-red-600 rounded-full" />
          </button>
        )}
      </div>
    </div>
  );
};
