import React from 'react';
import { AvatarConfig } from '../../types/client';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface AvatarPickerProps {
  avatar: AvatarConfig;
  onChange: (avatar: AvatarConfig) => void;
  size?: number;
  interactive?: boolean;
}

export const AVATAR_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#64748b'  // Slate
];

export const TOTAL_EYES = 8;
export const TOTAL_MOUTHS = 8;

export const AvatarDisplay: React.FC<{ avatar: AvatarConfig; size?: number }> = ({ avatar, size = 64 }) => {
  const { color, eyes, mouth } = avatar;

  const renderEyes = () => {
    switch (eyes % TOTAL_EYES) {
      case 0: // Normal dots
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#1e293b" />
            <circle cx="64" cy="42" r="5" fill="#1e293b" />
            <circle cx="38" cy="40" r="1.5" fill="#ffffff" />
            <circle cx="66" cy="40" r="1.5" fill="#ffffff" />
          </>
        );
      case 1: // Happy arcs
        return (
          <>
            <path d="M 30 44 Q 36 36 42 44" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 58 44 Q 64 36 70 44" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 2: // Sunglasses (Cool)
        return (
          <>
            <rect x="26" y="38" width="20" height="12" rx="4" fill="#0f172a" />
            <rect x="54" y="38" width="20" height="12" rx="4" fill="#0f172a" />
            <line x1="46" y1="42" x2="54" y2="42" stroke="#0f172a" strokeWidth="3" />
            <line x1="28" y1="40" x2="38" y2="48" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="40" x2="66" y2="48" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 3: // Big wide eyes
        return (
          <>
            <circle cx="35" cy="40" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
            <circle cx="65" cy="40" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
            <circle cx="35" cy="40" r="4" fill="#1e293b" />
            <circle cx="65" cy="40" r="4" fill="#1e293b" />
          </>
        );
      case 4: // Wink
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#1e293b" />
            <path d="M 58 43 Q 64 38 70 43" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 5: // Angry / determined brows
        return (
          <>
            <line x1="28" y1="36" x2="44" y2="42" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="72" y1="36" x2="56" y2="42" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="36" cy="44" r="4" fill="#1e293b" />
            <circle cx="64" cy="44" r="4" fill="#1e293b" />
          </>
        );
      case 6: // Dizzy X eyes
        return (
          <>
            <path d="M 32 38 L 40 46 M 40 38 L 32 46" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60 38 L 68 46 M 68 38 L 60 46" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case 7: // Cyclops
      default:
        return (
          <>
            <circle cx="50" cy="40" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
            <circle cx="50" cy="40" r="6" fill="#1e293b" />
            <circle cx="52" cy="38" r="2" fill="#ffffff" />
          </>
        );
    }
  };

  const renderMouth = () => {
    switch (mouth % TOTAL_MOUTHS) {
      case 0: // Cute smile
        return <path d="M 38 64 Q 50 75 62 64" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />;
      case 1: // Big open grin
        return (
          <path d="M 34 62 Q 50 82 66 62 Z" fill="#991b1b" stroke="#1e293b" strokeWidth="3.5" strokeLinejoin="round" />
        );
      case 2: // Tongue out
        return (
          <>
            <path d="M 36 62 Q 50 70 64 62" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 46 65 Q 50 78 54 65 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="2.5" />
          </>
        );
      case 3: // Whistle / cute O
        return <circle cx="50" cy="65" r="5" fill="#1e293b" />;
      case 4: // Mustache
        return (
          <path d="M 35 60 Q 43 55 50 63 Q 57 55 65 60 Q 57 68 50 64 Q 43 68 35 60 Z" fill="#1e293b" />
        );
      case 5: // Flat line / skeptical
        return <line x1="38" y1="65" x2="62" y2="65" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />;
      case 6: // Toothy grin
        return (
          <>
            <rect x="36" y="60" width="28" height="10" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
            <line x1="45" y1="60" x2="45" y2="70" stroke="#1e293b" strokeWidth="2" />
            <line x1="55" y1="60" x2="55" y2="70" stroke="#1e293b" strokeWidth="2" />
          </>
        );
      case 7: // Frown / Sad
      default:
        return <path d="M 38 70 Q 50 60 62 70" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />;
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md select-none">
      {/* Blob body */}
      <circle cx="50" cy="50" r="44" fill={color} stroke="#0f172a" strokeWidth="4.5" />
      {/* Highlight reflection */}
      <ellipse cx="38" cy="24" rx="14" ry="7" fill="#ffffff" fillOpacity="0.25" transform="rotate(-20 38 24)" />
      {/* Cheeks */}
      <circle cx="26" cy="54" r="5" fill="#f43f5e" fillOpacity="0.4" />
      <circle cx="74" cy="54" r="5" fill="#f43f5e" fillOpacity="0.4" />
      {/* Eyes */}
      {renderEyes()}
      {/* Mouth */}
      {renderMouth()}
    </svg>
  );
};

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ avatar, onChange, size = 110, interactive = true }) => {
  const cycleColor = (direction: number) => {
    const currentIndex = AVATAR_COLORS.indexOf(avatar.color);
    const nextIndex = (currentIndex + direction + AVATAR_COLORS.length) % AVATAR_COLORS.length;
    onChange({ ...avatar, color: AVATAR_COLORS[nextIndex] });
  };

  const cycleEyes = (direction: number) => {
    const nextEyes = (avatar.eyes + direction + TOTAL_EYES) % TOTAL_EYES;
    onChange({ ...avatar, eyes: nextEyes });
  };

  const cycleMouth = (direction: number) => {
    const nextMouth = (avatar.mouth + direction + TOTAL_MOUTHS) % TOTAL_MOUTHS;
    onChange({ ...avatar, mouth: nextMouth });
  };

  const randomize = () => {
    onChange({
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      eyes: Math.floor(Math.random() * TOTAL_EYES),
      mouth: Math.floor(Math.random() * TOTAL_MOUTHS)
    });
  };

  if (!interactive) {
    return <AvatarDisplay avatar={avatar} size={size} />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group p-2 bg-slate-800/80 rounded-2xl border-2 border-slate-700 shadow-inner">
        <AvatarDisplay avatar={avatar} size={size} />
        <button
          onClick={randomize}
          title="Randomize Avatar"
          className="absolute -top-2 -right-2 p-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <Shuffle size={14} className="stroke-[2.5]" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
        {/* Color control */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Color</span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => cycleColor(-1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            <div
              className="w-4 h-4 rounded-full border border-white/50"
              style={{ backgroundColor: avatar.color }}
            />
            <button
              onClick={() => cycleColor(1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Eyes control */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Eyes</span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => cycleEyes(-1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-slate-200 px-1">{avatar.eyes + 1}</span>
            <button
              onClick={() => cycleEyes(1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Mouth control */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Mouth</span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => cycleMouth(-1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-slate-200 px-1">{avatar.mouth + 1}</span>
            <button
              onClick={() => cycleMouth(1)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
