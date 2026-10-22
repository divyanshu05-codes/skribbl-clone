import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

export const ChatBox: React.FC = () => {
  const { chatMessages, sendChatMessage, isDrawer, hasGuessed, gameState } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const isDrawingPhase = gameState?.phase === 'DRAWING';

  const getInputPlaceholder = () => {
    if (isDrawer && isDrawingPhase) {
      return 'You are drawing! Chat with players who already guessed...';
    }
    if (hasGuessed && isDrawingPhase) {
      return 'You guessed it! Chat with drawer and guessers...';
    }
    return 'Type your guess or message here...';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Game Chat</span>
        {hasGuessed && isDrawingPhase && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <Sparkles size={11} /> Guessed Room
          </span>
        )}
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {chatMessages.length === 0 && (
          <div className="text-center text-slate-500 italic py-8">
            Welcome to the room! Send your guesses and messages here.
          </div>
        )}

        {chatMessages.map((msg) => {
          if (msg.type === 'guess_correct') {
            return (
              <div
                key={msg.id}
                className="p-2 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200 font-bold flex items-center gap-1.5 shadow-sm animate-pop"
              >
                <Sparkles size={14} className="text-emerald-400 shrink-0" />
                <span>{msg.text}</span>
                {msg.pointsAwarded && (
                  <span className="ml-auto text-emerald-300 bg-emerald-900/70 px-1.5 py-0.5 rounded text-[10px]">
                    +{msg.pointsAwarded} pts
                  </span>
                )}
              </div>
            );
          }

          if (msg.type === 'close_guess') {
            return (
              <div
                key={msg.id}
                className="p-2 bg-amber-950/70 border border-amber-500/50 rounded-xl text-amber-200 font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <AlertCircle size={14} className="text-amber-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'drawer_info') {
            return (
              <div key={msg.id} className="p-1.5 bg-emerald-950/20 rounded-lg text-emerald-300">
                <span className="font-bold">{msg.senderName}: </span>
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'system' || msg.type === 'join_leave') {
            return (
              <div key={msg.id} className="text-center text-[11px] text-slate-400 italic py-0.5">
                {msg.text}
              </div>
            );
          }

          return (
            <div key={msg.id} className="p-1 rounded hover:bg-slate-800/40 transition-colors">
              <span className="font-bold text-blue-400">{msg.senderName}: </span>
              <span className="text-slate-200">{msg.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-2 bg-slate-800/80 border-t border-slate-700/60 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getInputPlaceholder()}
          maxLength={100}
          className="flex-1 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 text-xs px-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
