import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Point, ToolType, CanvasAction, StrokeData } from '../../types/client';

interface CanvasProps {
  tool: ToolType;
  color: string;
  size: number;
}

export const Canvas: React.FC<CanvasProps> = ({ tool, color, size }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isDrawer, sendCanvasAction, canvasHistory } = useGame();
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<Point[]>([]);

  // Internal logical resolution (sharp crisp canvas)
  const LOGICAL_WIDTH = 1200;
  const LOGICAL_HEIGHT = 800;

  // Re-draw all actions from history onto the canvas
  const renderHistory = useCallback((actions: CanvasAction[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas to solid white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const action of actions) {
      if (action.type === 'stroke') {
        drawStroke(ctx, action.stroke, canvas.width, canvas.height);
      } else if (action.type === 'fill') {
        floodFill(ctx, action.point, action.color, canvas.width, canvas.height);
      }
    }
  }, []);

  // Smooth stroke drawing using quadratic curve interpolation
  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeData,
    width: number,
    height: number
  ) => {
    const points = stroke.points;
    if (!points || points.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = (stroke.size / 1000) * width;

    if (stroke.type === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
    }

    if (points.length === 1) {
      // Single dot tap
      const pt = points[0];
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, points[0].y * height);
      ctx.lineTo(points[1].x * width, points[1].y * height);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, points[0].y * height);

      for (let i = 1; i < points.length - 1; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2) * width;
        const yc = ((points[i].y + points[i + 1].y) / 2) * height;
        ctx.quadraticCurveTo(points[i].x * width, points[i].y * height, xc, yc);
      }

      const last = points[points.length - 1];
      ctx.lineTo(last.x * width, last.y * height);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Flood fill algorithm
  const floodFill = (
    ctx: CanvasRenderingContext2D,
    startPoint: Point,
    fillColorHex: string,
    width: number,
    height: number
  ) => {
    const startX = Math.floor(startPoint.x * width);
    const startY = Math.floor(startPoint.y * height);

    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const targetColor = getPixelColor(data, startX, startY, width);
    const fillColor = hexToRgba(fillColorHex);

    // If target and fill color are the same, nothing to do
    if (colorsMatch(targetColor, fillColor)) return;

    const queue: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (queue.length > 0) {
      const [x, y] = queue.pop()!;
      const idx = y * width + x;

      if (visited[idx]) continue;
      visited[idx] = 1;

      const currentColor = getPixelColor(data, x, y, width);
      if (colorsMatch(currentColor, targetColor, 24)) {
        setPixelColor(data, x, y, width, fillColor);

        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < width - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - width]) queue.push([x, y - 1]);
        if (y < height - 1 && !visited[idx + width]) queue.push([x, y + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  const setPixelColor = (
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    color: [number, number, number, number]
  ) => {
    const i = (y * width + x) * 4;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  };

  const colorsMatch = (c1: number[], c2: number[], tolerance: number = 0) => {
    return (
      Math.abs(c1[0] - c2[0]) <= tolerance &&
      Math.abs(c1[1] - c2[1]) <= tolerance &&
      Math.abs(c1[2] - c2[2]) <= tolerance &&
      Math.abs(c1[3] - c2[3]) <= tolerance
    );
  };

  const hexToRgba = (hex: string): [number, number, number, number] => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
  };

  // Re-render whenever history changes
  useEffect(() => {
    renderHistory(canvasHistory);
  }, [canvasHistory, renderHistory]);

  // Convert pointer event to normalized [0, 1] coordinate
  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  };

  // Pointer event handlers (works seamlessly across Mouse, Touch, Stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pt = getNormalizedPoint(e);
    if (!pt) return;

    if (tool === 'fill') {
      const fillAction: CanvasAction = {
        type: 'fill',
        point: pt,
        color
      };
      sendCanvasAction(fillAction);
      return;
    }

    setIsDrawing(true);
    currentPointsRef.current = [pt];

    // Live preview on local canvas for zero perceived latency
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawStroke(
          ctx,
          {
            id: 'temp',
            type: tool,
            color,
            size,
            points: [pt]
          },
          canvas.width,
          canvas.height
        );
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing) return;

    const pt = getNormalizedPoint(e);
    if (!pt) return;

    const pts = currentPointsRef.current;
    const last = pts[pts.length - 1];

    // Throttle duplicate points
    if (last && Math.abs(last.x - pt.x) < 0.001 && Math.abs(last.y - pt.y) < 0.001) {
      return;
    }

    pts.push(pt);

    // Live draw on local canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && pts.length >= 2) {
        const lastTwo = [pts[pts.length - 2], pt];
        drawStroke(
          ctx,
          {
            id: 'temp',
            type: tool,
            color,
            size,
            points: lastTwo
          },
          canvas.width,
          canvas.height
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing) return;
    setIsDrawing(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const pts = currentPointsRef.current;
    if (pts.length > 0) {
      const strokeAction: CanvasAction = {
        type: 'stroke',
        stroke: {
          id: 'stroke_' + Date.now() + Math.random().toString(36).substring(2, 6),
          type: tool,
          color,
          size,
          points: [...pts]
        }
      };
      sendCanvasAction(strokeAction);
    }
    currentPointsRef.current = [];
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 bg-slate-950/40 rounded-xl overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={LOGICAL_WIDTH}
        height={LOGICAL_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full h-auto aspect-[3/2] max-h-full bg-white rounded-lg shadow-2xl touch-none ${
          isDrawer ? 'cursor-crosshair' : 'cursor-default'
        }`}
      />
    </div>
  );
};
