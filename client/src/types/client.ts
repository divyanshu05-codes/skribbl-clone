export interface AvatarConfig {
  color: string;
  eyes: number; // 0 - 9
  mouth: number; // 0 - 9
}

export interface PlayerData {
  id: string;
  socketId: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  isHost: boolean;
  isDrawing: boolean;
  guessedCurrentRound: boolean;
  roundScore: number;
  isReady: boolean;
}

export type WordMode = 'normal' | 'hidden';

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number;
  wordCount: number;
  hintsCount: number;
  isPrivate: boolean;
  customWords: string[];
  wordMode: WordMode;
}

export type GamePhase = 'LOBBY' | 'STARTING' | 'CHOOSING_WORD' | 'DRAWING' | 'ROUND_END' | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export type ToolType = 'brush' | 'eraser' | 'fill';

export interface StrokeData {
  id: string;
  type: ToolType;
  color: string;
  size: number;
  points: Point[];
}

export type CanvasAction = 
  | { type: 'stroke'; stroke: StrokeData }
  | { type: 'fill'; point: Point; color: string }
  | { type: 'clear' }
  | { type: 'undo' };

export type ChatMessageType = 'chat' | 'system' | 'guess_correct' | 'close_guess' | 'drawer_info' | 'join_leave';

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  text: string;
  type: ChatMessageType;
  timestamp: number;
  pointsAwarded?: number;
}

export interface GameStatePayload {
  roomId: string;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  drawerId: string | null;
  drawerName: string | null;
  hintMask: string;
  wordLength: number;
  timeLeft: number;
  revealedWord?: string;
  wordChoices?: string[];
}

export interface RoomInfoPublic {
  id: string;
  code: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
}
