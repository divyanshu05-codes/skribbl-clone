import React from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarDisplay } from '../Lobby/AvatarPicker';
import { Trophy, Crown, RotateCcw, Home } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { gameState, players, player: myPlayer, startGame, leaveRoom } = useGame();

  if (gameState?.phase !== 'GAME_OVER') return null;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6">
        <div>
          <div className="inline-flex p-3 bg-yellow-500/20 text-yellow-400 rounded-2xl mb-2 animate-bounce">
            <Trophy size={36} />
          </div>
          <h2 className="text-3xl font-black text-white font-display">
            Game Over!
          </h2>
          <p className="text-slate-400 text-sm">
            Here are the final champions of the match!
          </p>
        </div>

        {/* Podium for top 3 */}
        <div className="flex items-end justify-center gap-3 pt-6 pb-2">
          {/* 2nd place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="mb-2">
                <AvatarDisplay avatar={second.avatar} size={50} />
              </div>
              <span className="text-xs font-bold text-slate-200 truncate w-full">
                {second.name}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {second.score} pts
              </span>
              <div className="w-full h-20 bg-slate-700/80 border-t-4 border-slate-400 rounded-t-xl flex items-center justify-center font-black text-xl text-slate-300 mt-2">
                2
              </div>
            </div>
          )}

          {/* 1st place (Winner) */}
          {winner && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-6">
              <div className="relative mb-2">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-400 animate-pulse">
                  <Crown size={28} className="fill-yellow-400" />
                </span>
                <AvatarDisplay avatar={winner.avatar} size={68} />
              </div>
              <span className="text-sm font-black text-yellow-400 truncate w-full">
                {winner.name}
              </span>
              <span className="text-xs font-bold text-yellow-200">
                {winner.score} pts
              </span>
              <div className="w-full h-28 bg-gradient-to-t from-yellow-600/40 to-yellow-500/80 border-t-4 border-yellow-300 rounded-t-2xl flex items-center justify-center font-black text-3xl text-yellow-950 mt-2 shadow-lg">
                1
              </div>
            </div>
          )}

          {/* 3rd place */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="mb-2">
                <AvatarDisplay avatar={third.avatar} size={46} />
              </div>
              <span className="text-xs font-bold text-slate-200 truncate w-full">
                {third.name}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {third.score} pts
              </span>
              <div className="w-full h-14 bg-amber-900/60 border-t-4 border-amber-600 rounded-t-xl flex items-center justify-center font-black text-lg text-amber-400 mt-2">
                3
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {myPlayer?.isHost ? (
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <RotateCcw size={18} /> Play Again
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Waiting for host to start another game...
            </div>
          )}

          <button
            onClick={leaveRoom}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Home size={18} /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
