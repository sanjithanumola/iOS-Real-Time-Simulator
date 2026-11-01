import React, { useState } from 'react';
import { ChevronLeft, Edit3, Trash2, Plus, Search } from 'lucide-react';
import { soundService } from '../../../services/soundService';

interface NoteItem {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: '1',
      title: 'iPhone Simulator Features',
      body: 'Real-time WebRTC audio & FaceTime calling\niMessage texting with voice memos & tapback\nDynamic Island animation pill\nFirebase Cloud Firestore sync',
      updatedAt: 'Today',
    },
    {
      id: '2',
      title: 'Grocery List',
      body: 'Apples, almond milk, coffee beans, sourdough bread, avocado.',
      updatedAt: 'Yesterday',
    },
  ]);

  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [search, setSearch] = useState('');

  const handleCreateNote = () => {
    soundService.playTap();
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'New Note',
      body: '',
      updatedAt: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const handleUpdateActiveNote = (title: string, body: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, title, body, updatedAt: 'Just now' };
    setActiveNote(updated);
    setNotes(notes.map((n) => (n.id === activeNote.id ? updated : n)));
  };

  const handleDeleteNote = (id: string) => {
    soundService.playTap();
    setNotes(notes.filter((n) => n.id !== id));
    setActiveNote(null);
  };

  if (activeNote) {
    return (
      <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-12 pb-4 px-4 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <button
            onClick={() => {
              soundService.playTap();
              setActiveNote(null);
            }}
            className="flex items-center text-amber-400 text-sm font-medium"
          >
            <ChevronLeft className="w-6 h-6 -ml-1.5" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => handleDeleteNote(activeNote.id)}
            className="text-red-400 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col py-3 overflow-y-auto">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => handleUpdateActiveNote(e.target.value, activeNote.body)}
            placeholder="Title"
            className="text-2xl font-bold bg-transparent text-white outline-hidden mb-2"
          />
          <textarea
            value={activeNote.body}
            onChange={(e) => handleUpdateActiveNote(activeNote.title, e.target.value)}
            placeholder="Start typing..."
            className="flex-1 bg-transparent text-sm text-neutral-300 outline-hidden resize-none leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <button
            onClick={handleCreateNote}
            className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow hover:bg-amber-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-neutral-900 text-white rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden"
          />
        </div>

        <div className="bg-neutral-900 rounded-2xl divide-y divide-neutral-800 overflow-hidden border border-neutral-800">
          {notes
            .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
            .map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  soundService.playTap();
                  setActiveNote(note);
                }}
                className="p-3 hover:bg-neutral-800/60 cursor-pointer transition-colors"
              >
                <h3 className="text-sm font-semibold text-white">{note.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-neutral-500 font-mono">{note.updatedAt}</span>
                  <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">{note.body}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
