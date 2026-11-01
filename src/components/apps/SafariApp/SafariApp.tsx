import React, { useState } from 'react';
import {
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Share2,
  BookOpen,
  Copy,
  Globe,
  ExternalLink
} from 'lucide-react';
import { soundService } from '../../../services/soundService';

export const SafariApp: React.FC = () => {
  const [url, setUrl] = useState('apple.com');
  const [inputVal, setInputVal] = useState('apple.com');
  const [currentPage, setCurrentPage] = useState<'home' | 'apple' | 'techcrunch' | 'wiki'>('apple');

  const bookmarks = [
    { title: 'Apple', url: 'apple.com', page: 'apple', color: 'bg-black' },
    { title: 'TechCrunch', url: 'techcrunch.com', page: 'techcrunch', color: 'bg-emerald-600' },
    { title: 'Wikipedia', url: 'wikipedia.org', page: 'wiki', color: 'bg-neutral-700' },
    { title: 'Google', url: 'google.com', page: 'home', color: 'bg-blue-600' },
  ];

  const handleNavigate = (pageKey: 'home' | 'apple' | 'techcrunch' | 'wiki', address: string) => {
    soundService.playTap();
    setCurrentPage(pageKey);
    setUrl(address);
    setInputVal(address);
  };

  return (
    <div className="w-full h-full bg-neutral-900 text-white flex flex-col justify-between pt-12 select-none overflow-hidden">
      {/* Web Page Content Container */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 text-white p-4">
        {currentPage === 'apple' && (
          <div className="space-y-4">
            <div className="text-center py-6 border-b border-neutral-800">
              <span className="text-3xl font-bold tracking-tight text-white">iPhone 16 Pro</span>
              <p className="text-lg text-neutral-400 mt-1">Hello, Apple Intelligence.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                  Learn more
                </button>
                <button className="border border-blue-500 text-blue-400 text-xs px-4 py-1.5 rounded-full font-semibold">
                  Buy
                </button>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <h3 className="font-bold text-sm text-white mb-1">Titanium Design</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Forged in titanium. Featuring the strong and lightweight Grade 5 titanium design with a refined micro-blasted finish.
              </p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <h3 className="font-bold text-sm text-white mb-1">Camera Control</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Take the perfect photo or video in record time with tactile Camera Control.
              </p>
            </div>
          </div>
        )}

        {currentPage === 'techcrunch' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-emerald-400">TechCrunch</h2>
            <div className="space-y-2">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-xs font-semibold text-white">WebRTC in Browser Simulator reaches near-zero latency</p>
                <p className="text-[11px] text-neutral-400 mt-1">Real-time peer communication transforms mobile virtualization on modern web engines.</p>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-xs font-semibold text-white">The Next Wave of Real-Time Multi-User Collaboration</p>
                <p className="text-[11px] text-neutral-400 mt-1">How cloud data stores and modern media streams enable synchronized multi-device apps.</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'wiki' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">Wikipedia</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>iOS</strong> is a mobile operating system developed by Apple Inc. exclusively for its smartphones. First unveiled in 2007 for the original iPhone, it has since powered millions of mobile interactions globally.
            </p>
          </div>
        )}

        {currentPage === 'home' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Favorites</h3>
            <div className="grid grid-cols-4 gap-3">
              {bookmarks.map((bm) => (
                <div
                  key={bm.title}
                  onClick={() => handleNavigate(bm.page as 'home' | 'apple' | 'techcrunch' | 'wiki', bm.url)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl ${bm.color} flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-300 truncate max-w-[60px] text-center">
                    {bm.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safari Bottom Address Bar & Toolbar */}
      <div className="p-2 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md space-y-2">
        {/* Floating URL pill */}
        <div className="bg-neutral-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNavigate('home', inputVal);
              }}
              className="bg-transparent flex-1 outline-hidden text-neutral-200 text-xs"
            />
          </div>
          <button
            onClick={() => handleNavigate(currentPage, inputVal)}
            className="text-neutral-400 hover:text-white"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Safari Controls */}
        <div className="flex items-center justify-around text-blue-500 py-1">
          <button onClick={() => handleNavigate('apple', 'apple.com')}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => handleNavigate('techcrunch', 'techcrunch.com')}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => soundService.playTap()}>
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={() => handleNavigate('home', 'favorites')}>
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
