import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarDisplay } from './AvatarPicker';
import {
  Play,
  Users,
  Clock,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Settings,
  Shield,
  LogOut,
  HelpCircle,
  FileText
} from 'lucide-react';

export const RoomLobby: React.FC = () => {
  const {
    roomCode,
    settings,
    players,
    player: myPlayer,
    startGame,
    updateSettings,
    leaveRoom
  } = useGame();

  const [copied, setCopied] = useState(false);
  const [customWordsInput, setCustomWordsInput] = useState(
    settings?.customWords?.join(', ') || ''
  );

  const copyInvite = () => {
    const url = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = Boolean(myPlayer?.isHost);

  const handleCustomWordsBlur = () => {
    if (!isHost) return;
    const words = customWordsInput
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2);
    updateSettings({ customWords: words });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-display font-black text-xl shadow-lg shadow-blue-600/30">
            🎨
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-wide">
              skribbl<span className="text-blue-500">.clone</span>
            </h1>
            <p className="text-xs text-slate-400">Multiplayer Drawing Lobby</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room Code Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Room Code:</span>
            <span className="font-mono font-black text-yellow-400 tracking-wider text-sm">
              {roomCode}
            </span>
            <button
              onClick={copyInvite}
              title="Copy Link"
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <button
            onClick={leaveRoom}
            className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 hover:border-rose-800 transition-colors"
            title="Leave Lobby"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Lobby Container */}
      <div className="max-w-6xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left: Player list (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <h2 className="text-lg font-black font-display">
                Players ({players.length} / {settings?.maxPlayers || 8})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {players.length < 2 ? 'Need at least 2 players to start' : 'Ready to draw!'}
            </span>
          </div>

          {/* Grid of Players */}
          <div className="flex-1 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto">
            {players.map((p) => {
              const isMe = p.id === myPlayer?.id;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-blue-950/40 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="relative mb-2">
                    <AvatarDisplay avatar={p.avatar} size={54} />
                    {p.isHost && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                        HOST
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                    {p.name}
                  </span>
                  {isMe && (
                    <span className="text-[10px] font-bold text-blue-400 mt-0.5">
                      (You)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Start Game Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={copyInvite}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 flex items-center gap-2 text-xs transition-colors"
            >
              <Copy size={14} />
              {copied ? 'Link Copied!' : 'Invite Friends'}
            </button>

            {isHost ? (
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black font-display rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={18} className="fill-white" /> Start Game
              </button>
            ) : (
              <div className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>

        {/* Right: Room Settings (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-amber-400" />
              <h2 className="text-lg font-black font-display">Room Settings</h2>
            </div>
            {isHost ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Editable
              </span>
            ) : (
              <span className="text-xs text-slate-500">Host Only</span>
            )}
          </div>

          <div className="flex-1 py-4 space-y-4 overflow-y-auto text-xs">
            {/* Max Players */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Max Players (2 - 20)</span>
              {isHost ? (
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={settings?.maxPlayers || 8}
                  onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) || 8 })}
                  className="w-16 bg-slate-900 text-white font-bold text-center p-1 rounded-lg border border-slate-700"
                />
              ) : (
                <span className="font-bold text-slate-200">{settings?.maxPlayers}</span>
              )}
            </div>

            {/* Rounds */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Rounds (2 - 10)</span>
              {isHost ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings?.rounds || 3}
                  onChange={(e) => updateSettings({ rounds: parseInt(e.target.value) || 3 })}
                  className="w-16 bg-slate-900 text-white font-bold text-center p-1 rounded-lg border border-slate-700"
                />
              ) : (
                <span className="font-bold text-slate-200">{settings?.rounds}</span>
              )}
            </div>

            {/* Draw Time */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Draw Time (seconds)</span>
              {isHost ? (
                <select
                  value={settings?.drawTime || 80}
                  onChange={(e) => updateSettings({ drawTime: parseInt(e.target.value) || 80 })}
                  className="bg-slate-900 text-white font-bold p-1 rounded-lg border border-slate-700"
                >
                  <option value="30">30s (Speed)</option>
                  <option value="60">60s</option>
                  <option value="80">80s (Standard)</option>
                  <option value="120">120s (Relaxed)</option>
                  <option value="180">180s</option>
                </select>
              ) : (
                <span className="font-bold text-slate-200">{settings?.drawTime}s</span>
              )}
            </div>

            {/* Word Choices Count */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Word Count (Choices)</span>
              {isHost ? (
                <select
                  value={settings?.wordCount || 3}
                  onChange={(e) => updateSettings({ wordCount: parseInt(e.target.value) || 3 })}
                  className="bg-slate-900 text-white font-bold p-1 rounded-lg border border-slate-700"
                >
                  <option value="1">1 word</option>
                  <option value="2">2 words</option>
                  <option value="3">3 words (Standard)</option>
                  <option value="4">4 words</option>
                  <option value="5">5 words</option>
                </select>
              ) : (
                <span className="font-bold text-slate-200">{settings?.wordCount}</span>
              )}
            </div>

            {/* Hints Count */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Hints Revealed</span>
              {isHost ? (
                <select
                  value={settings?.hintsCount ?? 2}
                  onChange={(e) => updateSettings({ hintsCount: parseInt(e.target.value) ?? 2 })}
                  className="bg-slate-900 text-white font-bold p-1 rounded-lg border border-slate-700"
                >
                  <option value="0">0 hints (Hardcore)</option>
                  <option value="1">1 hint</option>
                  <option value="2">2 hints (Standard)</option>
                  <option value="3">3 hints</option>
                </select>
              ) : (
                <span className="font-bold text-slate-200">{settings?.hintsCount}</span>
              )}
            </div>

            {/* Word Mode */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="font-bold text-slate-300">Word Mode</span>
              {isHost ? (
                <select
                  value={settings?.wordMode || 'normal'}
                  onChange={(e) => updateSettings({ wordMode: e.target.value as any })}
                  className="bg-slate-900 text-white font-bold p-1 rounded-lg border border-slate-700"
                >
                  <option value="normal">Normal (_ _ _ _)</option>
                  <option value="hidden">Hidden (???)</option>
                </select>
              ) : (
                <span className="font-bold text-slate-200 capitalize">{settings?.wordMode}</span>
              )}
            </div>

            {/* Custom Words */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" /> Custom Words
                </span>
                <span className="text-[10px] text-slate-500">Comma-separated</span>
              </div>
              {isHost ? (
                <textarea
                  rows={2}
                  value={customWordsInput}
                  onChange={(e) => setCustomWordsInput(e.target.value)}
                  onBlur={handleCustomWordsBlur}
                  placeholder="e.g. bitcoin, ethereum, web3, blockchain"
                  className="w-full bg-slate-900 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  {settings?.customWords && settings.customWords.length > 0
                    ? `${settings.customWords.length} custom words loaded`
                    : 'Using default word banks'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
