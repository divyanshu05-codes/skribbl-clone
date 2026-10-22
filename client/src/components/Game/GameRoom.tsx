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
  HelpCircle
} from 'lucide-react';

export const GameRoom: React.FC = () => {
  const {
    roomCode,
    gameState,
    isDrawer,
    hasGuessed,
    leaveRoom
  } = useGame();

  const [tool, setTool] = useState<ToolType>('brush');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(14);
  const [muted, setMuted] = useState(sound.isMuted());
  const [copied, setCopied] = useState(false);

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
    <div className="relative w-full h-screen max-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-16 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 z-20 shrink-0">
        {/* Left: Round & Timer */}
        <div className="flex items-center gap-3">
          {/* Round counter */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Round</span>
            <span className="text-sm font-extrabold text-blue-400 font-display">
              {gameState?.currentRound || 1} / {gameState?.totalRounds || 3}
            </span>
          </div>

          {/* Clock Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-black text-sm transition-all ${
              isTimeUrgent
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse scale-105'
                : 'bg-slate-800/80 border-slate-700 text-amber-400'
            }`}
          >
            <Clock size={16} />
            <span className="font-mono text-base">{timeLeft}s</span>
          </div>
        </div>

        {/* Center: Secret Word or Blank Hints */}
        <div className="flex flex-col items-center justify-center">
          {gameState?.phase === 'DRAWING' ? (
            <div className="flex flex-col items-center">
              {isDrawer || hasGuessed || gameState?.revealedWord ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Word:</span>
                  <span className="text-xl font-black text-emerald-400 tracking-wider font-display uppercase">
                    {gameState.revealedWord}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-sm">
                    {gameState?.hintMask || '_ '.repeat(gameState?.wordLength || 4)}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {gameState?.wordLength} letters
                  </span>
                </div>
              )}
            </div>
          ) : gameState?.phase === 'CHOOSING_WORD' ? (
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
              <Sparkles size={16} /> Drawer is selecting a word...
            </span>
          ) : (
            <span className="text-sm font-bold text-slate-400">
              Get ready...
            </span>
          )}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Room Code & Copy */}
          <button
            onClick={copyInvite}
            title="Copy Invite Link"
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{roomCode}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute' : 'Mute'}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Leave Room */}
          <button
            onClick={leaveRoom}
            title="Leave Game"
            className="p-2 text-rose-400 hover:text-white bg-slate-800 hover:bg-rose-950 rounded-xl border border-slate-700 hover:border-rose-700 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left: Players scoreboard (2.5 cols) */}
        <div className="col-span-3 lg:col-span-2.5 h-full min-h-0 flex flex-col">
          <ScoreBoard />
        </div>

        {/* Middle: Canvas & Toolbar (6.5 cols) */}
        <div className="col-span-6 lg:col-span-6.5 h-full min-h-0 flex flex-col gap-2 relative">
          <div className="flex-1 min-h-0 relative">
            <Canvas tool={tool} color={color} size={size} />

            {/* Overlays mounted inside canvas area */}
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
        <div className="col-span-3 lg:col-span-3 h-full min-h-0 flex flex-col">
          <ChatBox />
        </div>
      </main>

      {/* Game Over Modal (Full screen overlay) */}
      <GameOverModal />
    </div>
  );
};
