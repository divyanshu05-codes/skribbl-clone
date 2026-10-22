import React from 'react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Clock } from 'lucide-react';

export const WordSelectorModal: React.FC = () => {
  const { gameState, isDrawer, chooseWord } = useGame();

  if (gameState?.phase !== 'CHOOSING_WORD') return null;

  const wordChoices = gameState.wordChoices || [];

  if (!isDrawer) {
    return (
      <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-md shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-bounce">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            {gameState.drawerName || 'Drawer'} is choosing a word!
          </h2>
          <p className="text-slate-400 text-sm">
            Get ready to guess! Waiting for the drawer to pick from their choices.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-300 font-bold bg-slate-800/80 py-2 px-4 rounded-xl border border-slate-700">
            <Clock size={16} className="text-amber-400" />
            <span>Time remaining: {gameState.timeLeft}s</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
            Your Turn to Draw!
          </span>
          <h2 className="text-2xl font-black text-white font-display mt-2">
            Choose a Word
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
            <Clock size={13} className="text-amber-400" />
            <span>Auto-picks in {gameState.timeLeft}s</span>
          </div>
        </div>

        {/* Word Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {wordChoices.map((word) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              className="p-4 bg-slate-800/90 hover:bg-blue-600 border border-slate-700 hover:border-blue-400 text-white font-black text-base rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-blue-500/25 active:translate-y-0"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
