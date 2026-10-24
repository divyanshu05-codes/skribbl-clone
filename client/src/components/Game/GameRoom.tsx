import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { ScoreBoard } from './ScoreBoard';
import { ChatBox } from './ChatBox';
import { WordSelectorModal } from './WordSelectorModal';
import { RoundOverlay } from './RoundOverlay';
import { GameOverModal } from './GameOverModal';
import { ToolType } from '../../types/client';
import { sound } from '../Common/SoundEffects';
import {
  Clock,
  Volume2,
  VolumeX,
  LogOut,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Users
} from 'lucide-react';

export const GameRoom: React.FC = () => {
  const {
    roomCode,
    gameState,
    players,
    isDrawer,
    hasGuessed,
    leaveRoom
  } = useGame();

  const [tool, setTool] = useState<ToolType>('brush');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(14);
  const [muted, setMuted] = useState(sound.isMuted());
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'players'>('chat');

  const toggleMute = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
  };

  const copyInvite = () => {
    const url = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeLeft = gameState?.timeLeft ?? 0;
  const isTimeUrgent = timeLeft <= 10 && gameState?.phase === 'DRAWING';

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 px-2 sm:px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-4 z-20 shrink-0">
        {/* Left: Round & Timer */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Round counter */}
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Round</span>
            <span className="text-xs sm:text-sm font-extrabold text-blue-400 font-display">
              {gameState?.currentRound || 1}/{gameState?.totalRounds || 3}
            </span>
          </div>

          {/* Clock Timer */}
          <div
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border font-black text-xs sm:text-sm transition-all ${
              isTimeUrgent
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse scale-105'
                : 'bg-slate-800/80 border-slate-700 text-amber-400'
            }`}
          >
            <Clock size={14} className="sm:w-4 sm:h-4" />
            <span className="font-mono text-sm sm:text-base">{timeLeft}s</span>
          </div>
        </div>

        {/* Center: Secret Word or Blank Hints */}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1">
          {gameState?.phase === 'DRAWING' ? (
            <div className="flex flex-col items-center max-w-full">
              {isDrawer || hasGuessed || gameState?.revealedWord ? (
                <div className="flex items-center gap-1 sm:gap-2 truncate">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest hidden xs:inline">Word:</span>
                  <span className="text-sm sm:text-xl font-black text-emerald-400 tracking-wider font-display uppercase truncate">
                    {gameState.revealedWord}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3 max-w-full overflow-hidden">
                  <span className="font-mono text-sm sm:text-2xl font-black tracking-widest text-white drop-shadow-sm truncate">
                    {gameState?.hintMask || '_ '.repeat(gameState?.wordLength || 4)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                    {gameState?.wordLength} letters
                  </span>
                </div>
              )}
            </div>
          ) : gameState?.phase === 'CHOOSING_WORD' ? (
            <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1 sm:gap-1.5 animate-pulse truncate">
              <Sparkles size={14} className="shrink-0" /> Drawer picking...
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              Get ready...
            </span>
          )}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Room Code & Copy */}
          <button
            onClick={copyInvite}
            title="Copy Invite Link"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="hidden sm:inline">{roomCode}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute' : 'Mute'}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Leave Room */}
          <button
            onClick={leaveRoom}
            title="Leave Game"
            className="p-1.5 sm:p-2 text-rose-400 hover:text-white bg-slate-800 hover:bg-rose-950 rounded-xl border border-slate-700 hover:border-rose-700 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* DESKTOP LAYOUT (Screen width >= 1024px) */}
      <main className="hidden lg:grid grid-cols-12 gap-3 min-h-0 flex-1 p-3 overflow-hidden">
        {/* Left: Players scoreboard (3 cols) */}
        <div className="col-span-3 h-full min-h-0 flex flex-col">
          <ScoreBoard />
        </div>

        {/* Middle: Canvas & Toolbar (6 cols) */}
        <div className="col-span-6 h-full min-h-0 flex flex-col gap-2 relative">
          <div className="flex-1 min-h-0 relative">
            <Canvas tool={tool} color={color} size={size} />
            <WordSelectorModal />
            <RoundOverlay />
          </div>

          <div className="shrink-0">
            <Toolbar
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
            />
          </div>
        </div>

        {/* Right: Real-time chat & guesses (3 cols) */}
        <div className="col-span-3 h-full min-h-0 flex flex-col">
          <ChatBox />
        </div>
      </main>

      {/* MOBILE / TABLET LAYOUT (Screen width < 1024px) */}
      <main className="flex lg:hidden flex-col flex-1 min-h-0 overflow-hidden p-2 gap-2">
        {/* Top: Responsive Canvas Area */}
        <div className="w-full shrink-0 flex flex-col gap-1.5">
          <div className="w-full relative aspect-[3/2] max-h-[38vh] min-h-[190px] mx-auto">
            <Canvas tool={tool} color={color} size={size} />
            <WordSelectorModal />
            <RoundOverlay />
          </div>

          {/* Mobile Toolbar (if Drawer) */}
          <div className="w-full shrink-0">
            <Toolbar
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
            />
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 gap-1">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'chat'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare size={13} /> Chat & Guess
          </button>
          <button
            onClick={() => setMobileTab('players')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'players'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={13} /> Players ({players.length})
          </button>
        </div>

        {/* Bottom Panel: Dynamic Tab (Chat or Scoreboard) */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'chat' ? (
            <ChatBox />
          ) : (
            <ScoreBoard />
          )}
        </div>
      </main>

      {/* Game Over Modal (Full screen overlay) */}
      <GameOverModal />
    </div>
  );
};
