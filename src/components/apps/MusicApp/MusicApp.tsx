import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Music as MusicIcon } from 'lucide-react';
import { soundService } from '../../../services/soundService';

interface MusicAppProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentSong: { title: string; artist: string; albumArt: string };
  onNextSong?: () => void;
}

export const MusicApp: React.FC<MusicAppProps> = ({
  isPlaying,
  onTogglePlay,
  currentSong,
  onNextSong,
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white flex flex-col justify-between pt-14 pb-8 px-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between text-neutral-400 text-xs">
        <span className="font-semibold uppercase tracking-wider">Apple Music</span>
        <MusicIcon className="w-4 h-4 text-rose-500" />
      </div>

      {/* Album Artwork */}
      <div className="my-auto flex flex-col items-center">
        <div className="w-60 h-60 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-800">
          <img src={currentSong.albumArt} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Song Info */}
        <div className="w-full flex items-center justify-between mt-6 px-2">
          <div className="overflow-hidden">
            <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
            <p className="text-sm text-neutral-400 truncate">{currentSong.artist}</p>
          </div>
          <button onClick={() => soundService.playTap()} className="text-neutral-400 hover:text-rose-500">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="w-full mt-4 px-2">
          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className={`h-full bg-white transition-all ${isPlaying ? 'w-2/5 animate-pulse' : 'w-1/4'}`} />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
            <span>1:24</span>
            <span>-2:18</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-8 mt-6">
          <button onClick={() => soundService.playTap()} className="text-white/80 hover:text-white">
            <SkipBack className="w-7 h-7" />
          </button>
          <button
            onClick={() => {
              soundService.playTap();
              onTogglePlay();
            }}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
          <button
            onClick={() => {
              soundService.playTap();
              if (onNextSong) onNextSong();
            }}
            className="text-white/80 hover:text-white"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
