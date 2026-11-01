import React, { useState } from 'react';
import { ChevronLeft, Heart, Share2, Trash2, X } from 'lucide-react';
import { soundService } from '../../../services/soundService';

interface PhotosAppProps {
  capturedPhotos: string[];
  onDeletePhoto?: (photoUrl: string) => void;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({
  capturedPhotos,
  onDeletePhoto,
}) => {
  const initialPhotos = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80',
  ];

  const allPhotos = [...capturedPhotos, ...initialPhotos];
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 select-none overflow-hidden">
      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between p-4 pt-12">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundService.playTap();
                setSelectedPhoto(null);
              }}
              className="p-2 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-xs font-semibold">Photo</span>
            <div className="w-6" />
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <img src={selectedPhoto} alt="" className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl" />
          </div>

          <div className="flex items-center justify-around py-2 border-t border-neutral-800">
            <button
              onClick={() => {
                soundService.playTap();
                setIsLiked(!isLiked);
              }}
              className={`p-2 ${isLiked ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => soundService.playTap()}
              className="p-2 text-neutral-400 hover:text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                soundService.playTap();
                if (onDeletePhoto) onDeletePhoto(selectedPhoto);
                setSelectedPhoto(null);
              }}
              className="p-2 text-neutral-400 hover:text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Library View */}
      <div className="flex-1 flex flex-col px-4 overflow-y-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Library</h1>

        <div className="grid grid-cols-3 gap-1">
          {allPhotos.map((photo, i) => (
            <div
              key={i}
              onClick={() => {
                soundService.playTap();
                setSelectedPhoto(photo);
              }}
              className="aspect-square bg-neutral-900 overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
