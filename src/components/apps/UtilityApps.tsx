import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  MapPin,
  ShoppingBag,
  Folder,
  ChevronLeft,
  Plus,
  Search,
  Navigation,
  Download,
  File
} from 'lucide-react';
import { soundService } from '../../services/soundService';

// Calendar App
export const CalendarApp: React.FC = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">November 2026</h1>
          <CalendarIcon className="w-6 h-6 text-red-500" />
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-neutral-400 mb-2">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {days.map((day) => (
            <div
              key={day}
              onClick={() => soundService.playTap()}
              className={`p-2 rounded-full cursor-pointer hover:bg-neutral-800 ${
                day === 1 ? 'bg-red-600 text-white font-bold' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-neutral-800 pt-4">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Upcoming Events</h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 border-l-4 border-l-red-500">
            <p className="text-sm font-semibold">WebRTC Simulator Live Demo</p>
            <p className="text-xs text-neutral-400">10:00 AM - 11:30 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reminders App
export const RemindersApp: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Test WebRTC Audio Call with peer', done: true },
    { id: '2', title: 'Send simulated voice memo in iMessage', done: false },
    { id: '3', title: 'Customize iOS 18 wallpaper in Settings', done: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id: string) => {
    soundService.playTap();
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    soundService.playTap();
    setTasks([...tasks, { id: Date.now().toString(), title: newTask.trim(), done: false }]);
    setNewTask('');
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Reminders</h1>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-neutral-900 rounded-2xl p-3 border border-neutral-800">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mb-1">
              {tasks.length}
            </div>
            <span className="text-xs font-semibold text-neutral-400">All</span>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-3 border border-neutral-800">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-1">
              {tasks.filter((t) => t.done).length}
            </div>
            <span className="text-xs font-semibold text-neutral-400">Completed</span>
          </div>
        </div>

        <div className="divide-y divide-neutral-800">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="py-3 flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-neutral-500'
                }`}
              >
                {task.done && <span className="text-xs">✓</span>}
              </div>
              <span className={`text-sm ${task.done ? 'line-through text-neutral-500' : 'text-white'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-neutral-800">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Reminder"
          className="flex-1 bg-neutral-900 text-xs px-3 py-2 rounded-xl text-white outline-hidden"
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
        />
        <button
          onClick={addTask}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Maps App
export const MapsApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-neutral-900 text-white flex flex-col justify-between pt-12 pb-4 select-none overflow-hidden relative">
      {/* Simulated Map View Canvas */}
      <div className="absolute inset-0 bg-[#0e1626] flex items-center justify-center">
        {/* Map Grid Roads */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="w-32 h-1 bg-blue-500/40 rotate-45" />
        <div className="w-64 h-1.5 bg-amber-500/40 -rotate-12" />

        {/* Location Pin */}
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center animate-ping" />
          <div className="absolute top-2 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg">
            <Navigation className="w-3 h-3 text-white" />
          </div>
          <span className="mt-5 text-[11px] font-semibold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur">
            Apple Park, Cupertino
          </span>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="relative z-10 px-4 pt-2">
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Maps"
            defaultValue="1 Apple Park Way"
            className="bg-transparent flex-1 text-xs outline-hidden text-white"
          />
        </div>
      </div>
    </div>
  );
};

// App Store App
export const AppStoreApp: React.FC = () => {
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});

  const apps = [
    { id: '1', name: 'Instagram', cat: 'Photo & Video', size: '240 MB' },
    { id: '2', name: 'Spotify', cat: 'Music & Audio', size: '180 MB' },
    { id: '3', name: 'Uber', cat: 'Travel & Local', size: '110 MB' },
    { id: '4', name: 'WhatsApp', cat: 'Social Networking', size: '95 MB' },
  ];

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">App Store</h1>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white mb-4 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-white/80">Major Release</span>
          <h3 className="text-lg font-bold">iOS 18 Simulator</h3>
          <p className="text-xs text-white/80 mt-1">Experience real-time WebRTC calling and messaging in browser.</p>
        </div>

        <div className="divide-y divide-neutral-800">
          {apps.map((app) => (
            <div key={app.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-sm">
                  {app.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{app.name}</p>
                  <p className="text-xs text-neutral-400">{app.cat}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundService.playTap();
                  setDownloaded({ ...downloaded, [app.id]: true });
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  downloaded[app.id] ? 'bg-neutral-800 text-neutral-400' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {downloaded[app.id] ? 'OPEN' : 'GET'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Files App
export const FilesApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Files</h1>
        <div className="grid grid-cols-2 gap-3">
          {['Downloads', 'Documents', 'iCloud Drive', 'Photos'].map((folder) => (
            <div
              key={folder}
              onClick={() => soundService.playTap()}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800/60 transition-colors"
            >
              <Folder className="w-10 h-10 text-sky-400 fill-sky-400/20" />
              <span className="text-xs font-semibold">{folder}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
