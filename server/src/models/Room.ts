import { RoomSettings, ChatMessage, RoomInfoPublic, GamePhase, GameStatePayload } from '../types/game.js';
import { Player } from './Player.js';
import { Game, GameCallbacks } from './Game.js';

export class Room {
  public readonly id: string;
  public readonly code: string;
  public hostId: string;
  public players: Map<string, Player> = new Map();
  public settings: RoomSettings;
  public game: Game;
  public chatMessages: ChatMessage[] = [];
  public bannedIds: Set<string> = new Set();
  public votekicks: Map<string, Set<string>> = new Map(); // targetId -> Set<voterId>
  public createdAt: number = Date.now();

  constructor(id: string, code: string, hostPlayer: Player, settings?: Partial<RoomSettings>, callbacks?: Partial<GameCallbacks>) {
    this.id = id;
    this.code = code.toUpperCase();
    this.hostId = hostPlayer.id;

    this.settings = {
      maxPlayers: Math.min(20, Math.max(2, settings?.maxPlayers ?? 8)),
      rounds: Math.min(10, Math.max(1, settings?.rounds ?? 3)),
      drawTime: Math.min(240, Math.max(15, settings?.drawTime ?? 80)),
      wordCount: Math.min(5, Math.max(1, settings?.wordCount ?? 3)),
      hintsCount: Math.min(5, Math.max(0, settings?.hintsCount ?? 2)),
      isPrivate: settings?.isPrivate ?? false,
      customWords: settings?.customWords ?? [],
      wordMode: settings?.wordMode ?? 'normal'
    };

    const emptyCallbacks: GameCallbacks = {
      onPhaseChange: () => {},
      onTimeTick: () => {},
      onHintUpdate: () => {},
      onRoundEnd: () => {},
      onGameOver: () => {},
      onSystemMessage: () => {}
    };

    this.game = new Game({ ...emptyCallbacks, ...callbacks });
    this.game.setSettings(this.settings);

    this.addPlayer(hostPlayer);
  }

  public setCallbacks(callbacks: GameCallbacks): void {
    this.game = new Game(callbacks);
    this.game.setSettings(this.settings);
  }

  public addPlayer(player: Player): boolean {
    if (this.bannedIds.has(player.id)) return false;
    if (this.players.size >= this.settings.maxPlayers) return false;

    if (this.players.size === 0) {
      player.isHost = true;
      this.hostId = player.id;
    } else {
      player.isHost = (player.id === this.hostId);
    }

    this.players.set(player.id, player);
    return true;
  }

  public removePlayer(playerId: string): Player | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    this.players.delete(playerId);
    this.votekicks.delete(playerId);
    // remove votes cast by this player
    for (const voters of this.votekicks.values()) {
      voters.delete(playerId);
    }

    // Reassign host if host leaves
    if (player.isHost && this.players.size > 0) {
      const nextHost = this.players.values().next().value;
      if (nextHost) {
        nextHost.isHost = true;
        this.hostId = nextHost.id;
      }
    }

    this.game.handlePlayerDisconnect(playerId, Array.from(this.players.values()));

    return player;
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  public getPlayerBySocket(socketId: string): Player | undefined {
    return Array.from(this.players.values()).find(p => p.socketId === socketId);
  }

  public getPlayersList(): Player[] {
    return Array.from(this.players.values());
  }

  public updateSettings(newSettings: Partial<RoomSettings>): void {
    if (newSettings.maxPlayers !== undefined) {
      this.settings.maxPlayers = Math.max(this.players.size, Math.min(20, Math.max(2, newSettings.maxPlayers)));
    }
    if (newSettings.rounds !== undefined) {
      this.settings.rounds = Math.min(10, Math.max(1, newSettings.rounds));
    }
    if (newSettings.drawTime !== undefined) {
      this.settings.drawTime = Math.min(240, Math.max(15, newSettings.drawTime));
    }
    if (newSettings.wordCount !== undefined) {
      this.settings.wordCount = Math.min(5, Math.max(1, newSettings.wordCount));
    }
    if (newSettings.hintsCount !== undefined) {
      this.settings.hintsCount = Math.min(5, Math.max(0, newSettings.hintsCount));
    }
    if (newSettings.isPrivate !== undefined) {
      this.settings.isPrivate = newSettings.isPrivate;
    }
    if (newSettings.customWords !== undefined) {
      this.settings.customWords = newSettings.customWords;
    }
    if (newSettings.wordMode !== undefined) {
      this.settings.wordMode = newSettings.wordMode;
    }

    this.game.setSettings(this.settings);
  }

  public voteKick(voterId: string, targetId: string): { kicked: boolean; count: number; required: number } {
    if (!this.players.has(targetId) || voterId === targetId) {
      return { kicked: false, count: 0, required: 0 };
    }

    if (!this.votekicks.has(targetId)) {
      this.votekicks.set(targetId, new Set());
    }

    const voters = this.votekicks.get(targetId)!;
    voters.add(voterId);

    const totalPlayers = this.players.size;
    // Majority needed (more than 50% of the other players)
    const required = Math.max(2, Math.floor(totalPlayers / 2) + 1);

    if (voters.size >= required) {
      this.bannedIds.add(targetId);
      this.removePlayer(targetId);
      return { kicked: true, count: voters.size, required };
    }

    return { kicked: false, count: voters.size, required };
  }

  public kickPlayer(targetId: string, isBan: boolean = false): boolean {
    if (!this.players.has(targetId)) return false;
    if (isBan) {
      this.bannedIds.add(targetId);
    }
    this.removePlayer(targetId);
    return true;
  }

  public isFull(): boolean {
    return this.players.size >= this.settings.maxPlayers;
  }

  public isEmpty(): boolean {
    return this.players.size === 0;
  }

  public toPublicInfo(): RoomInfoPublic {
    const host = this.players.get(this.hostId);
    return {
      id: this.id,
      code: this.code,
      hostName: host ? host.name : 'Unknown',
      playerCount: this.players.size,
      maxPlayers: this.settings.maxPlayers,
      phase: this.game.phase,
      currentRound: this.game.currentRound,
      totalRounds: this.game.totalRounds
    };
  }

  public destroy(): void {
    this.game.destroy();
    this.players.clear();
    this.chatMessages = [];
  }
}
