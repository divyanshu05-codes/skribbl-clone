import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  PlayerData,
  RoomSettings,
  GameStatePayload,
  ChatMessage,
  CanvasAction,
  AvatarConfig,
  RoomInfoPublic
} from '../types/client';
import { sound } from '../components/Common/SoundEffects';
import { triggerConfetti, triggerSmallCelebration } from '../components/Common/Confetti';

interface GameContextType {
  socket: Socket | null;
  connected: boolean;
  player: PlayerData | null;
  roomId: string | null;
  roomCode: string | null;
  settings: RoomSettings | null;
  players: PlayerData[];
  gameState: GameStatePayload | null;
  chatMessages: ChatMessage[];
  canvasHistory: CanvasAction[];
  publicRooms: RoomInfoPublic[];
  isDrawer: boolean;
  hasGuessed: boolean;
  errorMessage: string | null;
  clearError: () => void;
  createRoom: (hostName: string, avatar: AvatarConfig, settings?: Partial<RoomSettings>) => void;
  joinRoom: (roomIdOrCode: string, playerName: string, avatar: AvatarConfig) => void;
  quickJoin: (playerName: string, avatar: AvatarConfig) => void;
  getPublicRooms: () => void;
  startGame: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  chooseWord: (word: string) => void;
  sendChatMessage: (text: string) => void;
  sendCanvasAction: (action: CanvasAction) => void;
  clearCanvas: () => void;
  undoCanvas: () => void;
  voteKick: (targetId: string) => void;
  hostKick: (targetId: string, isBan?: boolean) => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [settings, setSettings] = useState<RoomSettings | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [canvasHistory, setCanvasHistory] = useState<CanvasAction[]>([]);
  const [publicRooms, setPublicRooms] = useState<RoomInfoPublic[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize socket connection once
  useEffect(() => {
    // In dev, Vite proxies /socket.io to backend port 3001
    // In production, served from same host
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setErrorMessage(null);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setRoomCode(data.roomCode);
      setPlayer(data.player);
      setSettings(data.settings);
      setChatMessages([]);
      setCanvasHistory([]);
    });

    socket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setRoomCode(data.roomCode);
      setPlayer(data.player);
      setSettings(data.settings);
      setChatMessages([]);
    });

    socket.on('join_error', (data) => {
      setErrorMessage(data.message || 'Error joining room');
    });

    socket.on('error_message', (data) => {
      setErrorMessage(data.message);
    });

    socket.on('players_update', (updatedPlayers: PlayerData[]) => {
      setPlayers(updatedPlayers);
      if (player) {
        const me = updatedPlayers.find(p => p.id === player.id);
        if (me) setPlayer(me);
      }
    });

    socket.on('settings_updated', (data) => {
      setSettings(data.settings);
    });

    socket.on('game_state', (state: GameStatePayload) => {
      setGameState(prevState => {
        // Sound trigger when phase changes
        if (prevState?.phase !== state.phase) {
          if (state.phase === 'CHOOSING_WORD' && state.drawerId === player?.id) {
            sound.playTurnStart();
          } else if (state.phase === 'ROUND_END') {
            sound.playRoundEnd();
          } else if (state.phase === 'GAME_OVER') {
            sound.playGameOver();
            triggerConfetti();
          }
        }
        return state;
      });
    });

    socket.on('time_tick', ({ timeLeft }: { timeLeft: number }) => {
      setGameState(prev => prev ? { ...prev, timeLeft } : null);
      if (timeLeft <= 5 && timeLeft > 0) {
        sound.playTick();
      }
    });

    socket.on('hint_update', ({ hintMask }: { hintMask: string }) => {
      setGameState(prev => prev ? { ...prev, hintMask } : null);
    });

    socket.on('round_end', ({ word, scores }: { word: string; scores: any[] }) => {
      setGameState(prev => prev ? { ...prev, phase: 'ROUND_END', revealedWord: word } : null);
      sound.playRoundEnd();
    });

    socket.on('game_over', () => {
      setGameState(prev => prev ? { ...prev, phase: 'GAME_OVER' } : null);
      sound.playGameOver();
      triggerConfetti();
    });

    socket.on('canvas_history', ({ actions }: { actions: CanvasAction[] }) => {
      setCanvasHistory(actions);
    });

    socket.on('canvas_action', (action: CanvasAction) => {
      setCanvasHistory(prev => [...prev, action]);
    });

    socket.on('canvas_clear', () => {
      setCanvasHistory([]);
    });

    socket.on('draw_undo', () => {
      setCanvasHistory(prev => prev.slice(0, -1));
    });

    socket.on('chat_message', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
      if (msg.type === 'guess_correct') {
        sound.playCorrect();
        if (msg.senderId === player?.id) {
          triggerSmallCelebration();
        }
      }
    });

    socket.on('public_rooms_list', (list: RoomInfoPublic[]) => {
      setPublicRooms(list);
    });

    socket.on('quick_join_found', ({ roomId: targetId }: { roomId: string }) => {
      if (player) {
        socket.emit('join_room', {
          roomId: targetId,
          playerName: player.name,
          avatar: player.avatar
        });
      }
    });

    socket.on('kicked_notice', ({ message }: { message: string }) => {
      alert(message);
      leaveRoom();
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('join_error');
      socket.off('error_message');
      socket.off('players_update');
      socket.off('settings_updated');
      socket.off('game_state');
      socket.off('time_tick');
      socket.off('hint_update');
      socket.off('round_end');
      socket.off('game_over');
      socket.off('canvas_history');
      socket.off('canvas_action');
      socket.off('canvas_clear');
      socket.off('draw_undo');
      socket.off('chat_message');
      socket.off('public_rooms_list');
      socket.off('quick_join_found');
      socket.off('kicked_notice');
    };
  }, [socket, player]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const createRoom = useCallback((hostName: string, avatar: AvatarConfig, newSettings?: Partial<RoomSettings>) => {
    if (!socket) return;
    socket.emit('create_room', { hostName, avatar, settings: newSettings });
  }, [socket]);

  const joinRoom = useCallback((roomIdOrCode: string, playerName: string, avatar: AvatarConfig) => {
    if (!socket) return;
    socket.emit('join_room', { roomId: roomIdOrCode, playerName, avatar });
  }, [socket]);

  const quickJoin = useCallback((playerName: string, avatar: AvatarConfig) => {
    if (!socket) return;
    socket.emit('quick_join', { playerName, avatar });
  }, [socket]);

  const getPublicRooms = useCallback(() => {
    if (!socket) return;
    socket.emit('get_public_rooms');
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit('start_game');
  }, [socket]);

  const updateSettings = useCallback((newSettings: Partial<RoomSettings>) => {
    if (!socket) return;
    socket.emit('update_settings', { settings: newSettings });
  }, [socket]);

  const chooseWord = useCallback((word: string) => {
    if (!socket) return;
    socket.emit('word_chosen', { word });
  }, [socket]);

  const sendChatMessage = useCallback((text: string) => {
    if (!socket || !text.trim()) return;
    socket.emit('chat_message', { text: text.trim() });
  }, [socket]);

  const sendCanvasAction = useCallback((action: CanvasAction) => {
    if (!socket) return;
    socket.emit('canvas_action', action);
    setCanvasHistory(prev => [...prev, action]);
  }, [socket]);

  const clearCanvas = useCallback(() => {
    if (!socket) return;
    socket.emit('canvas_clear');
    setCanvasHistory([]);
  }, [socket]);

  const undoCanvas = useCallback(() => {
    if (!socket) return;
    socket.emit('draw_undo');
    setCanvasHistory(prev => prev.slice(0, -1));
  }, [socket]);

  const voteKick = useCallback((targetId: string) => {
    if (!socket) return;
    socket.emit('vote_kick', { targetId });
  }, [socket]);

  const hostKick = useCallback((targetId: string, isBan: boolean = false) => {
    if (!socket) return;
    socket.emit('host_kick', { targetId, isBan });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    setRoomId(null);
    setRoomCode(null);
    setGameState(null);
    setPlayers([]);
    setChatMessages([]);
    setCanvasHistory([]);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  const isDrawer = useMemo(() => {
    return Boolean(gameState && player && gameState.drawerId === player.id);
  }, [gameState, player]);

  const hasGuessed = useMemo(() => {
    return Boolean(player?.guessedCurrentRound);
  }, [player]);

  return (
    <GameContext.Provider
      value={{
        socket,
        connected,
        player,
        roomId,
        roomCode,
        settings,
        players,
        gameState,
        chatMessages,
        canvasHistory,
        publicRooms,
        isDrawer,
        hasGuessed,
        errorMessage,
        clearError,
        createRoom,
        joinRoom,
        quickJoin,
        getPublicRooms,
        startGame,
        updateSettings,
        chooseWord,
        sendChatMessage,
        sendCanvasAction,
        clearCanvas,
        undoCanvas,
        voteKick,
        hostKick,
        leaveRoom
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
