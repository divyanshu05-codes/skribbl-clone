import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ToolType } from '../../types/client';
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  RotateCcw,
  Trash2,
  Pipette
} from 'lucide-react';

interface ToolbarProps {
  tool: ToolType;
  setTool: (t: ToolType) => void;
  color: string;
  setColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
}

export const SKRIBBL_PALETTE = [
  '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
  '#880015', '#b97a57', '#ed1c24', '#ffaec9',
  '#ff7f27', '#ffc90e', '#fff200', '#efe4b0',
  '#22b14c', '#b5e61d', '#00a2e8', '#99d9ea',
  '#3f48cc', '#7092be', '#a349a4', '#c8bfe7'
];

export const BRUSH_SIZES = [
  { label: 'S', size: 6, dotRadius: 4 },
  { label: 'M', size: 14, dotRadius: 7 },
  { label: 'L', size: 28, dotRadius: 11 },
  { label: 'XL', size: 48, dotRadius: 15 }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize
}) => {
  const { isDrawer, clearCanvas, undoCanvas } = useGame();

  // Keyboard shortcut Ctrl+Z / Cmd+Z for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrawer) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoCanvas();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawer, undoCanvas]);

  if (!isDrawer) {
    return (
      <div className="flex items-center justify-center py-2 px-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-slate-400 text-sm italic">
        👀 Viewing drawer's canvas... Guess the word in chat!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-xl select-none">
      {/* Tool buttons */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
        <button
          onClick={() => setTool('brush')}
          title="Pen / Brush"
          className={`p-2 rounded-lg transition-all ${
            tool === 'brush'
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Paintbrush size={18} />
        </button>

        <button
          onClick={() => setTool('fill')}
          title="Bucket / Fill Tool"
          className={`p-2 rounded-lg transition-all ${
            tool === 'fill'
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PaintBucket size={18} />
        </button>

        <button
          onClick={() => setTool('eraser')}
          title="Eraser"
          className={`p-2 rounded-lg transition-all ${
            tool === 'eraser'
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eraser size={18} />
        </button>
      </div>

      {/* Brush sizes */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700/50">
        {BRUSH_SIZES.map((b) => (
          <button
            key={b.label}
            onClick={() => setSize(b.size)}
            title={`Size ${b.label}`}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              size === b.size
                ? 'bg-blue-600/40 border border-blue-400 text-blue-300'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: b.dotRadius, height: b.dotRadius }}
            />
          </button>
        ))}
      </div>

      {/* Colors palette */}
      <div className="flex items-center gap-2">
        {/* Active color preview & custom picker */}
        <div className="relative group flex items-center">
          <label
            title="Custom Color"
            className="w-8 h-8 rounded-xl border-2 border-white/60 shadow-md cursor-pointer overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === 'eraser') setTool('brush');
              }}
              className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
            />
            <Pipette size={14} className="text-white mix-blend-difference opacity-75" />
          </label>
        </div>

        {/* 20 palette colors in 2 rows of 10 */}
        <div className="grid grid-cols-10 gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50">
          {SKRIBBL_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (tool === 'eraser') setTool('brush');
              }}
              className={`w-5 h-5 rounded-md transition-transform hover:scale-125 border ${
                color.toLowerCase() === c.toLowerCase() && tool !== 'eraser'
                  ? 'border-white scale-110 shadow-sm ring-2 ring-blue-500'
                  : 'border-black/30'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Undo and Clear actions */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
        <button
          onClick={undoCanvas}
          title="Undo (Ctrl+Z)"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={clearCanvas}
          title="Clear Canvas"
          className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition-all active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
