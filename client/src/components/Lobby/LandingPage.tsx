import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarPicker, AVATAR_COLORS } from './AvatarPicker';
import { AvatarConfig, RoomSettings } from '../../types/client';
import {
  Play,
  PlusCircle,
  LogIn,
  Globe,
  Users,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const RANDOM_NAMES = [
  'Picasso', 'DaVinci', 'Doodler', 'ArtMaster', 'Sketchy',
  'PencilHero', 'PixelKnight', 'ColorCraze', 'NinjaArtist', 'CanvasBoss'
];

export const LandingPage: React.FC = () => {
  const {
    createRoom,
    joinRoom,
    quickJoin,
    getPublicRooms,
    publicRooms,
    errorMessage,
    clearError
  } = useGame();

  const [name, setName] = useState(() => {
    return localStorage.getItem('skribbl_name') || 
      RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  });

  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    return {
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      eyes: Math.floor(Math.random() * 8),
      mouth: Math.floor(Math.random() * 8)
    };
  });

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'public'>('play');

  // New room settings state
  const [customSettings, setCustomSettings] = useState<Partial<RoomSettings>>({
    maxPlayers: 8,
    rounds: 3,
    drawTime: 80,
    wordCount: 3,
    hintsCount: 2,
    isPrivate: true,
    wordMode: 'normal',
    customWords: []
  });
  const [customWordsText, setCustomWordsText] = useState('');

  // Check URL query parameters for ?room=ABCD
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinCodeInput(roomParam.toUpperCase());
    }
  }, []);

  // Fetch public rooms periodically when tab is active
  useEffect(() => {
    if (activeTab === 'public') {
      getPublicRooms();
      const interval = setInterval(getPublicRooms, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, getPublicRooms]);

  const handleNameChange = (val: string) => {
    setName(val);
    localStorage.setItem('skribbl_name', val);
  };

  const handleQuickPlay = () => {
    if (!name.trim()) return;
    quickJoin(name.trim(), avatar);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !joinCodeInput.trim()) return;
    joinRoom(joinCodeInput.trim(), name.trim(), avatar);
  };

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    const words = customWordsText
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2);

    createRoom(name.trim(), avatar, {
      ...customSettings,
      customWords: words
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-4xl">🎨</span>
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white drop-shadow-md">
              skribbl<span className="text-blue-500">.clone</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-semibold">
            Real-time Multiplayer Drawing & Guessing Pictionary
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 bg-rose-950/80 border border-rose-500/60 rounded-2xl flex items-center justify-between gap-3 text-rose-200 text-xs font-bold animate-pop shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white text-xs font-black uppercase px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Card Body */}
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6">
          {/* Avatar Customizer */}
          <AvatarPicker avatar={avatar} onChange={setAvatar} size={110} />

          {/* Name Input */}
          <div className="w-full max-w-sm space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Enter Your Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={20}
              placeholder="Your nickname..."
              className="w-full text-center text-lg font-black bg-slate-800/80 text-white placeholder:text-slate-500 px-4 py-2.5 rounded-2xl border-2 border-slate-700 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
          </div>

          {/* Tabs: Play vs Public Rooms */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 w-full max-w-sm">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'play'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Play & Create
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'public'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={13} /> Public Rooms
            </button>
          </div>

          {activeTab === 'play' ? (
            <div className="w-full max-w-sm space-y-3">
              {/* Quick Play button */}
              <button
                onClick={handleQuickPlay}
                disabled={!name.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-black font-display text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={18} className="fill-white" /> Quick Play
              </button>

              {/* Create Room button */}
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!name.trim()}
                className="w-full py-3 bg-blue-600/90 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm rounded-2xl border border-blue-400/40 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle size={16} /> Create Private Room
              </button>

              {/* Join by Code Form */}
              <form onSubmit={handleJoinByCode} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  maxLength={10}
                  className="flex-1 bg-slate-800 text-white font-mono font-bold text-center tracking-wider text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || !joinCodeInput.trim()}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-slate-600 flex items-center gap-1.5 transition-colors"
                >
                  <LogIn size={14} /> Join
                </button>
              </form>
            </div>
          ) : (
            /* Public Rooms Browser */
            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Active Public Games</span>
                <button
                  onClick={getPublicRooms}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {publicRooms.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-800/40 rounded-xl border border-slate-800">
                    No active public games found. Use "Quick Play" to start one!
                  </div>
                ) : (
                  publicRooms.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">
                          {r.hostName}'s Room
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Code: {r.code} • Round {r.currentRound}/{r.totalRounds}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Users size={12} /> {r.playerCount}/{r.maxPlayers}
                        </span>
                        <button
                          onClick={() => joinRoom(r.code, name.trim(), avatar)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-xs"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black font-display text-white">
              Create New Room
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Max Players (2 - 20)</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={customSettings.maxPlayers}
                  onChange={(e) =>
                    setCustomSettings({ ...customSettings, maxPlayers: parseInt(e.target.value) || 8 })
                  }
                  className="w-16 bg-slate-800 text-white text-center font-bold p-1.5 rounded-lg border border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Rounds</span>
                <select
                  value={customSettings.rounds}
                  onChange={(e) =>
                    setCustomSettings({ ...customSettings, rounds: parseInt(e.target.value) || 3 })
                  }
                  className="bg-slate-800 text-white font-bold p-1.5 rounded-lg border border-slate-700"
                >
                  <option value="2">2 Rounds</option>
                  <option value="3">3 Rounds</option>
                  <option value="5">5 Rounds</option>
                  <option value="8">8 Rounds</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Draw Time</span>
                <select
                  value={customSettings.drawTime}
                  onChange={(e) =>
                    setCustomSettings({ ...customSettings, drawTime: parseInt(e.target.value) || 80 })
                  }
                  className="bg-slate-800 text-white font-bold p-1.5 rounded-lg border border-slate-700"
                >
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="80">80 seconds (Standard)</option>
                  <option value="120">120 seconds</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Privacy</span>
                <select
                  value={customSettings.isPrivate ? 'private' : 'public'}
                  onChange={(e) =>
                    setCustomSettings({ ...customSettings, isPrivate: e.target.value === 'private' })
                  }
                  className="bg-slate-800 text-white font-bold p-1.5 rounded-lg border border-slate-700"
                >
                  <option value="private">Private (Invite Link Only)</option>
                  <option value="public">Public (Open in Lobby)</option>
                </select>
              </div>

              <div className="space-y-1 pt-1">
                <span className="font-bold text-slate-300 block">Custom Words (Optional)</span>
                <textarea
                  rows={2}
                  value={customWordsText}
                  onChange={(e) => setCustomWordsText(e.target.value)}
                  placeholder="pizza, telescope, astronaut..."
                  className="w-full bg-slate-800 text-white text-xs p-2 rounded-xl border border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  handleCreateRoom();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
