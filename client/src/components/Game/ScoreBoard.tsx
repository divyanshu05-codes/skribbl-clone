import React from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarDisplay } from '../Lobby/AvatarPicker';
import { Crown, Pencil, CheckCircle2, MoreVertical, Ban, UserX } from 'lucide-react';

export const ScoreBoard: React.FC = () => {
  const { players, gameState, player: myPlayer, voteKick, hostKick } = useGame();
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="px-3 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Players</span>
        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-950/80 text-blue-400 rounded-full border border-blue-800/50">
          {players.length} online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedPlayers.map((p, index) => {
          const isCurrentDrawer = p.id === gameState?.drawerId;
          const isMe = p.id === myPlayer?.id;
          const hasGuessed = p.guessedCurrentRound;

          return (
            <div
              key={p.id}
              className={`relative flex items-center justify-between p-2 rounded-xl border transition-all ${
                hasGuessed
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                  : isCurrentDrawer
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                  : isMe
                  ? 'bg-blue-950/30 border-blue-500/40'
                  : 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Rank rank number */}
                <span className="text-xs font-bold text-slate-400 w-4 text-center">
                  #{index + 1}
                </span>

                {/* Avatar */}
                <div className="relative">
                  <AvatarDisplay avatar={p.avatar} size={36} />
                  {p.isHost && (
                    <span
                      title="Room Host"
                      className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-900 p-0.5 rounded-full shadow"
                    >
                      <Crown size={11} className="stroke-[2.5]" />
                    </span>
                  )}
                </div>

                {/* Name & status */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold truncate ${isMe ? 'text-blue-400' : 'text-slate-200'}`}>
                      {p.name} {isMe && '(You)'}
                    </span>
                    {isCurrentDrawer && (
                      <span title="Drawing now" className="text-amber-400 animate-pulse">
                        <Pencil size={13} />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {p.score} pts
                  </span>
                </div>
              </div>

              {/* Guessed indicator or options menu */}
              <div className="flex items-center gap-1.5">
                {hasGuessed && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-700/50 animate-pop">
                    <CheckCircle2 size={12} />
                    <span>+{p.roundScore || ''}</span>
                  </div>
                )}

                {/* Options button (votekick / host kick) */}
                {!isMe && (
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {activeMenuId === p.id && (
                      <div className="absolute right-0 top-6 z-30 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 text-xs">
                        <button
                          onClick={() => {
                            voteKick(p.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <UserX size={13} /> Vote to Kick
                        </button>

                        {myPlayer?.isHost && (
                          <button
                            onClick={() => {
                              hostKick(p.id, true);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                          >
                            <Ban size={13} /> Ban Player
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
