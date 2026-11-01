import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Phone,
  Video,
  MessageCircle,
  Mail,
  Star,
  Trash2,
  Edit2,
  ChevronLeft,
  X,
  UserCheck
} from 'lucide-react';
import { SimulatorUser, Contact } from '../../../types/ios';
import { soundService } from '../../../services/soundService';
import { ContactsService } from '../../../services/contactsService';

interface ContactsAppProps {
  currentUser: SimulatorUser;
  contacts: Contact[];
  onStartAudioCall: (phone: string, name: string) => void;
  onStartVideoCall: (phone: string, name: string) => void;
  onStartMessage: (phone: string, name: string) => void;
}

export const ContactsApp: React.FC<ContactsAppProps> = ({
  currentUser,
  contacts,
  onStartAudioCall,
  onStartVideoCall,
  onStartMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleSaveContact = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    soundService.playTap();

    try {
      await ContactsService.addContact(currentUser.uid, {
        name: newName.trim(),
        phoneNumber: newPhone.trim(),
        email: newEmail.trim() || undefined,
        notes: newNotes.trim() || undefined,
        isFavorite,
      });

      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewNotes('');
      setIsFavorite(false);
      setIsAddingContact(false);
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    soundService.playTap();
    try {
      await ContactsService.deleteContact(currentUser.uid, contactId);
      setSelectedContact(null);
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const handleToggleFavorite = async (contact: Contact) => {
    soundService.playTap();
    try {
      await ContactsService.updateContact(currentUser.uid, contact.id, {
        isFavorite: !contact.isFavorite,
      });
      if (selectedContact && selectedContact.id === contact.id) {
        setSelectedContact({ ...selectedContact, isFavorite: !selectedContact.isFavorite });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  // Contact Detail View
  if (selectedContact) {
    return (
      <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-12 pb-6 px-4 select-none">
        {/* Top Header */}
        <div className="h-12 flex items-center justify-between border-b border-neutral-800">
          <button
            onClick={() => {
              soundService.playTap();
              setSelectedContact(null);
            }}
            className="flex items-center text-blue-500 font-medium text-sm"
          >
            <ChevronLeft className="w-6 h-6 -ml-1.5" />
            <span>Contacts</span>
          </button>
          <button
            onClick={() => handleToggleFavorite(selectedContact)}
            className="p-1 text-amber-400"
          >
            <Star className={`w-5 h-5 ${selectedContact.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Contact Profile Header */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-neutral-700 border-2 border-neutral-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden mb-3">
              {selectedContact.photoURL ? (
                <img src={selectedContact.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedContact.name[0]}</span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-center">{selectedContact.name}</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedContact.phoneNumber}</p>
          </div>

          {/* Quick 4-Action Buttons */}
          <div className="grid grid-cols-4 gap-2 my-5 px-2">
            {/* Message */}
            <button
              onClick={() => {
                soundService.playTap();
                onStartMessage(selectedContact.phoneNumber, selectedContact.name);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-blue-400 fill-blue-400/20" />
              <span className="text-[10px] text-blue-400 font-medium">message</span>
            </button>

            {/* Call */}
            <button
              onClick={() => {
                soundService.playTap();
                onStartAudioCall(selectedContact.phoneNumber, selectedContact.name);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-colors"
            >
              <Phone className="w-5 h-5 text-blue-400 fill-blue-400/20" />
              <span className="text-[10px] text-blue-400 font-medium">call</span>
            </button>

            {/* FaceTime */}
            <button
              onClick={() => {
                soundService.playTap();
                onStartVideoCall(selectedContact.phoneNumber, selectedContact.name);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-colors"
            >
              <Video className="w-5 h-5 text-blue-400 fill-blue-400/20" />
              <span className="text-[10px] text-blue-400 font-medium">FaceTime</span>
            </button>

            {/* Mail */}
            <button
              onClick={() => soundService.playTap()}
              className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-colors opacity-70"
            >
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] text-blue-400 font-medium">mail</span>
            </button>
          </div>

          {/* Contact Details Card */}
          <div className="bg-neutral-900 rounded-2xl p-3.5 space-y-3 border border-neutral-800 mx-1">
            <div>
              <p className="text-[10px] uppercase font-semibold text-neutral-400">phone</p>
              <p className="text-sm font-mono text-blue-400 mt-0.5">{selectedContact.phoneNumber}</p>
            </div>
            {selectedContact.email && (
              <div className="border-t border-neutral-800 pt-2">
                <p className="text-[10px] uppercase font-semibold text-neutral-400">email</p>
                <p className="text-sm text-blue-400 mt-0.5">{selectedContact.email}</p>
              </div>
            )}
            {selectedContact.notes && (
              <div className="border-t border-neutral-800 pt-2">
                <p className="text-[10px] uppercase font-semibold text-neutral-400">notes</p>
                <p className="text-xs text-neutral-300 mt-0.5">{selectedContact.notes}</p>
              </div>
            )}
          </div>

          {/* Delete Contact Button */}
          <div className="mt-6 px-1">
            <button
              onClick={() => handleDeleteContact(selectedContact.id)}
              className="w-full bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Contact
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Contacts List View
  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <button
            onClick={() => {
              soundService.playTap();
              setIsAddingContact(true);
            }}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow hover:bg-blue-500"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-neutral-900 text-white rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Add Contact Modal */}
        <AnimatePresence>
          {isAddingContact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-3 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">New Contact</span>
                <button onClick={() => setIsAddingContact(false)}>
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Simulator Phone (e.g. +1 (555) 234-5678)"
                  className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-xl outline-hidden font-mono focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes"
                  className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs text-neutral-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    Add to Favorites
                  </label>

                  <button
                    onClick={handleSaveContact}
                    disabled={!newName.trim() || !newPhone.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Card at Top */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3 mb-3 shadow">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-base text-white overflow-hidden shadow">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser.displayName[0]}</span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">My Card</span>
            <p className="text-sm font-bold text-white">{currentUser.displayName}</p>
            <p className="text-xs text-blue-400 font-mono">{currentUser.phoneNumber}</p>
          </div>
        </div>

        {/* Contacts Alphabetical List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
          {filteredContacts.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-neutral-500 text-xs">
              <p>No Contacts Found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  soundService.playTap();
                  setSelectedContact(contact);
                }}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-neutral-900 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{contact.name}</p>
                  <p className="text-xs text-neutral-500 font-mono">{contact.phoneNumber}</p>
                </div>
                {contact.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
