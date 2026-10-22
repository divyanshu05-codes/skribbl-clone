import React from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarDisplay } from '../Lobby/AvatarPicker';
import { Award, Clock } from 'lucide-react';

export const RoundOverlay: React.FC = () => {
  const { gameState, players } = useGame();

  if (gameState?.phase !== 'ROUND_END') return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Round Complete
          </span>
          <h2 className="text-xl font-bold text-slate-300 mt-2">The word was:</h2>
          <div className="text-3xl font-black text-emerald-400 tracking-wider font-display uppercase mt-1">
            {gameState.revealedWord}
          </div>
        </div>

        {/* Round Scores Overview */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 max-h-56 overflow-y-auto space-y-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <AvatarDisplay avatar={p.avatar} size={28} />
                <span className="text-xs font-bold text-slate-200">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                {p.roundScore > 0 ? (
                  <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-850">
                    +{p.roundScore} pts
                  </span>
                ) : (
                  <span className="text-slate-500">+0 pts</span>
                )}
                <span className="text-slate-300">{p.score} total</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock size={13} className="text-amber-400" />
          <span>Next turn starting in {gameState.timeLeft}s...</span>
        </div>
      </div>
    </div>
  );
};
