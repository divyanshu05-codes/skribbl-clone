import { Server, Socket } from 'socket.io';
import { RoomManager } from '../services/RoomManager.js';
import { Player } from '../models/Player.js';
import { CanvasAction, GameStatePayload, RoomSettings, AvatarConfig, ChatMessage } from '../types/game.js';

export function registerSocketHandlers(io: Server) {
  const roomManager = RoomManager.getInstance();

  io.on('connection', (socket: Socket) => {
    // console.log(`[Socket] Connected: ${socket.id}`);

    // Helper to send game state customized for a specific player
    const sendStateToPlayer = (room: any, player: Player, socketToSend: Socket) => {
      const isDrawer = room.game.currentDrawerId === player.id;
      const hasGuessed = player.guessedCurrentRound;
      const isRoundOver = room.game.phase === 'ROUND_END' || room.game.phase === 'GAME_OVER';

      // Secret word is visible only if you are the drawer, or you already guessed, or round is over
      const canSeeWord = isDrawer || hasGuessed || isRoundOver;

      const payload: GameStatePayload = {
        roomId: room.id,
        phase: room.game.phase,
        currentRound: room.game.currentRound,
        totalRounds: room.game.totalRounds,
        drawerId: room.game.currentDrawerId,
        drawerName: room.getPlayer(room.game.currentDrawerId || '')?.name || null,
        hintMask: room.game.phase === 'DRAWING'
          ? (room.game.wordMode === 'hidden' ? '???' : room.game.callbacks?.getMask?.() || '')
          : '',
        wordLength: room.game.currentWord ? room.game.currentWord.length : 0,
        timeLeft: room.game.timeLeft,
        revealedWord: canSeeWord ? room.game.currentWord : undefined,
        wordChoices: (isDrawer && room.game.phase === 'CHOOSING_WORD') ? room.game.wordChoices : undefined
      };

      socketToSend.emit('game_state', payload);
    };

    // Helper to broadcast state to all players in a room
    const broadcastGameState = (room: any) => {
      for (const player of room.players.values()) {
        const pSocket = io.sockets.sockets.get(player.socketId);
        if (pSocket) {
          sendStateToPlayer(room, player, pSocket);
        }
      }
    };

    // Attach callbacks to a room
    const setupRoomCallbacks = (room: any) => {
      room.setCallbacks({
        onPhaseChange: (phase: string, payload: any) => {
          broadcastGameState(room);
          io.to(room.id).emit('players_update', room.getPlayersList().map((p: Player) => p.toJSON()));
        },
        onTimeTick: (timeLeft: number) => {
          io.to(room.id).emit('time_tick', { timeLeft });
        },
        onHintUpdate: (mask: string) => {
          // Send hint mask to non-drawers who haven't guessed yet
          for (const player of room.players.values()) {
            if (player.id !== room.game.currentDrawerId && !player.guessedCurrentRound) {
              io.to(player.socketId).emit('hint_update', { hintMask: mask });
            }
          }
        },
        onRoundEnd: (revealedWord: string, scores: any[]) => {
          io.to(room.id).emit('round_end', {
            word: revealedWord,
            scores,
            nextDrawer: null
          });
          io.to(room.id).emit('players_update', room.getPlayersList().map((p: Player) => p.toJSON()));
        },
        onGameOver: (leaderboard: Player[]) => {
          io.to(room.id).emit('game_over', {
            leaderboard: leaderboard.map(p => p.toJSON()),
            winner: leaderboard[0]?.toJSON() || null
          });
        },
        onSystemMessage: (text: string) => {
          const sysMsg: ChatMessage = {
            id: 'sys_' + Date.now() + Math.random().toString(36).substring(2, 6),
            text,
            type: 'system',
            timestamp: Date.now()
          };
          io.to(room.id).emit('chat_message', sysMsg);
        }
      });
    };

    // 1. CREATE ROOM
    socket.on('create_room', ({ hostName, avatar, settings }: { hostName: string; avatar: AvatarConfig; settings?: Partial<RoomSettings> }) => {
      const host = new Player('p_' + Math.random().toString(36).substring(2, 9), socket.id, hostName, avatar, true);
      const room = roomManager.createRoom(host, settings);

      setupRoomCallbacks(room);

      socket.join(room.id);
      socket.emit('room_created', {
        roomId: room.id,
        roomCode: room.code,
        player: host.toJSON(),
        settings: room.settings
      });

      sendStateToPlayer(room, host, socket);
      socket.emit('players_update', room.getPlayersList().map(p => p.toJSON()));
    });

    // 2. JOIN ROOM
    socket.on('join_room', ({ roomId, playerName, avatar }: { roomId: string; playerName: string; avatar: AvatarConfig }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('join_error', { message: 'Room not found. Check code or link.' });
        return;
      }

      if (room.isFull()) {
        socket.emit('join_error', { message: 'Room is already full!' });
        return;
      }

      if (room.bannedIds.has(socket.id)) {
        socket.emit('join_error', { message: 'You have been kicked/banned from this room.' });
        return;
      }

      const player = new Player('p_' + Math.random().toString(36).substring(2, 9), socket.id, playerName, avatar, false);
      const added = room.addPlayer(player);
      if (!added) {
        socket.emit('join_error', { message: 'Unable to join room.' });
        return;
      }

      socket.join(room.id);

      socket.emit('room_joined', {
        roomId: room.id,
        roomCode: room.code,
        player: player.toJSON(),
        settings: room.settings
      });

      // Send canvas history so new player catches up immediately
      socket.emit('canvas_history', { actions: room.game.canvasActions });

      // Notify others in room
      const joinMsg: ChatMessage = {
        id: 'join_' + Date.now(),
        text: `${player.name} joined the room!`,
        type: 'join_leave',
        timestamp: Date.now()
      };
      io.to(room.id).emit('chat_message', joinMsg);
      io.to(room.id).emit('players_update', room.getPlayersList().map(p => p.toJSON()));
      io.to(room.id).emit('player_joined', { player: player.toJSON() });

      sendStateToPlayer(room, player, socket);
    });

    // 3. GET PUBLIC ROOMS & QUICK JOIN
    socket.on('get_public_rooms', () => {
      socket.emit('public_rooms_list', roomManager.getPublicRooms());
    });

    socket.on('quick_join', ({ playerName, avatar }: { playerName: string; avatar: AvatarConfig }) => {
      const targetRoom = roomManager.getRandomPublicRoom();
      if (targetRoom) {
        socket.emit('quick_join_found', { roomId: targetRoom.id });
      } else {
        // Auto-create an open public room!
        const host = new Player('p_' + Math.random().toString(36).substring(2, 9), socket.id, playerName, avatar, true);
        const room = roomManager.createRoom(host, { isPrivate: false });
        setupRoomCallbacks(room);

        socket.join(room.id);
        socket.emit('room_created', {
          roomId: room.id,
          roomCode: room.code,
          player: host.toJSON(),
          settings: room.settings
        });

        sendStateToPlayer(room, host, socket);
        socket.emit('players_update', room.getPlayersList().map(p => p.toJSON()));
      }
    });

    // 4. START GAME (Host only)
    socket.on('start_game', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || !player.isHost) {
        socket.emit('error_message', { message: 'Only room host can start the game.' });
        return;
      }

      if (room.players.size < 2) {
        socket.emit('error_message', { message: 'Need at least 2 players to start!' });
        return;
      }

      room.game.startGame(room.getPlayersList());
    });

    // 5. UPDATE SETTINGS (Host only)
    socket.on('update_settings', ({ settings }: { settings: Partial<RoomSettings> }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || !player.isHost) return;

      room.updateSettings(settings);
      io.to(room.id).emit('settings_updated', { settings: room.settings });
    });

    // 6. WORD SELECTION (Drawer chooses word)
    socket.on('word_chosen', ({ word }: { word: string }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || player.id !== room.game.currentDrawerId) return;

      room.game.selectWord(word, room.getPlayersList());
    });

    // 7. REAL-TIME DRAWING ACTIONS
    socket.on('canvas_action', (action: CanvasAction) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || player.id !== room.game.currentDrawerId) return;
      if (room.game.phase !== 'DRAWING') return;

      room.game.addCanvasAction(action);
      // Broadcast to all other clients in room
      socket.to(room.id).emit('canvas_action', action);
    });

    // Clear canvas
    socket.on('canvas_clear', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || player.id !== room.game.currentDrawerId) return;

      room.game.addCanvasAction({ type: 'clear' });
      io.to(room.id).emit('canvas_clear');
    });

    // Undo stroke
    socket.on('draw_undo', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player || player.id !== room.game.currentDrawerId) return;

      room.game.addCanvasAction({ type: 'undo' });
      io.to(room.id).emit('draw_undo');
    });

    // 8. CHAT & GUESSING
    socket.on('chat_message', ({ text }: { text: string }) => {
      const clean = text?.trim();
      if (!clean) return;

      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player) return;

      const isDrawer = player.id === room.game.currentDrawerId;
      const isDrawingPhase = room.game.phase === 'DRAWING';

      // If during drawing phase and player is a guesser who hasn't guessed yet
      if (isDrawingPhase && !isDrawer && !player.guessedCurrentRound) {
        const { isCorrect, isClose, pointsAwarded } = room.game.handleGuess(
          player,
          clean,
          room.getPlayersList()
        );

        if (isCorrect) {
          // Announcement to everyone: Player guessed the word!
          const correctMsg: ChatMessage = {
            id: 'cor_' + Date.now() + Math.random().toString(36).substring(2, 6),
            senderId: player.id,
            senderName: player.name,
            text: `${player.name} guessed the word!`,
            type: 'guess_correct',
            timestamp: Date.now(),
            pointsAwarded
          };

          io.to(room.id).emit('chat_message', correctMsg);
          io.to(room.id).emit('guess_result', {
            correct: true,
            playerId: player.id,
            playerName: player.name,
            points: pointsAwarded
          });

          // Send the revealed word to the player who guessed
          sendStateToPlayer(room, player, socket);
          io.to(room.id).emit('players_update', room.getPlayersList().map(p => p.toJSON()));
          return;
        }

        if (isClose) {
          // Send private tip to this player
          const closeMsg: ChatMessage = {
            id: 'tip_' + Date.now(),
            text: `'${clean}' is very close!`,
            type: 'close_guess',
            timestamp: Date.now()
          };
          socket.emit('chat_message', closeMsg);
          return;
        }
      }

      // If player has already guessed or is the drawer:
      // Separate their chat messages to the "Guessed / Drawer Chat" so they don't spoil for active guessers!
      if (isDrawingPhase && (player.guessedCurrentRound || isDrawer)) {
        const guessedChatMsg: ChatMessage = {
          id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 6),
          senderId: player.id,
          senderName: player.name,
          text: clean,
          type: 'drawer_info',
          timestamp: Date.now()
        };

        for (const p of room.players.values()) {
          if (p.guessedCurrentRound || p.id === room.game.currentDrawerId) {
            io.to(p.socketId).emit('chat_message', guessedChatMsg);
          }
        }
        return;
      }

      // Normal chat / incorrect guess shown to all players
      const normalMsg: ChatMessage = {
        id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 6),
        senderId: player.id,
        senderName: player.name,
        text: clean,
        type: 'chat',
        timestamp: Date.now()
      };
      io.to(room.id).emit('chat_message', normalMsg);
    });

    // 9. MODERATION: KICK & VOTEKICK
    socket.on('vote_kick', ({ targetId }: { targetId: string }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player) return;

      const target = room.getPlayer(targetId);
      if (!target) return;

      const { kicked, count, required } = room.voteKick(player.id, targetId);

      const voteMsg: ChatMessage = {
        id: 'vk_' + Date.now(),
        text: `Votekick on ${target.name}: (${count}/${required}) votes.`,
        type: 'system',
        timestamp: Date.now()
      };
      io.to(room.id).emit('chat_message', voteMsg);

      if (kicked) {
        const targetSocket = io.sockets.sockets.get(target.socketId);
        if (targetSocket) {
          targetSocket.emit('kicked_notice', { message: 'You have been vote-kicked from the room.' });
          targetSocket.leave(room.id);
        }
        io.to(room.id).emit('players_update', room.getPlayersList().map(p => p.toJSON()));
      }
    });

    // Host direct kick
    socket.on('host_kick', ({ targetId, isBan }: { targetId: string; isBan?: boolean }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const host = room.getPlayerBySocket(socket.id);
      if (!host || !host.isHost) return;

      const target = room.getPlayer(targetId);
      if (!target || target.isHost) return;

      room.kickPlayer(targetId, isBan);

      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.emit('kicked_notice', { message: isBan ? 'You were banned by the host.' : 'You were kicked by the host.' });
        targetSocket.leave(room.id);
      }

      const kickMsg: ChatMessage = {
        id: 'hk_' + Date.now(),
        text: `${target.name} was ${isBan ? 'banned' : 'kicked'} by host.`,
        type: 'system',
        timestamp: Date.now()
      };
      io.to(room.id).emit('chat_message', kickMsg);
      io.to(room.id).emit('players_update', room.getPlayersList().map(p => p.toJSON()));
    });

    // 10. DISCONNECT HANDLER
    socket.on('disconnect', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player) return;

      room.removePlayer(player.id);

      const leaveMsg: ChatMessage = {
        id: 'leave_' + Date.now(),
        text: `${player.name} left the room.`,
        type: 'join_leave',
        timestamp: Date.now()
      };
      io.to(room.id).emit('chat_message', leaveMsg);
      io.to(room.id).emit('players_update', room.getPlayersList().map(p => p.toJSON()));
      io.to(room.id).emit('player_left', { playerId: player.id });

      // If room is empty, remove it
      if (room.isEmpty()) {
        roomManager.removeRoom(room.id);
      }
    });
  });
}
