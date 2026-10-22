import { Room } from '../models/Room.js';
import { Player } from '../models/Player.js';
import { RoomSettings, RoomInfoPublic } from '../types/game.js';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room> = new Map(); // roomId -> Room
  private codeToId: Map<string, string> = new Map(); // roomCode -> roomId

  private constructor() {
    // Periodic cleanup of idle/empty rooms
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.codeToId.has(code));
    return code;
  }

  public createRoom(hostPlayer: Player, settings?: Partial<RoomSettings>): Room {
    const id = 'room_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const code = this.generateCode();

    const room = new Room(id, code, hostPlayer, settings);
    this.rooms.set(id, room);
    this.codeToId.set(code, id);

    return room;
  }

  public getRoom(idOrCode: string): Room | undefined {
    if (!idOrCode) return undefined;
    const clean = idOrCode.trim();
    if (this.rooms.has(clean)) {
      return this.rooms.get(clean);
    }
    const upperCode = clean.toUpperCase();
    if (this.codeToId.has(upperCode)) {
      const id = this.codeToId.get(upperCode)!;
      return this.rooms.get(id);
    }
    return undefined;
  }

  public findRoomByPlayerId(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) {
        return room;
      }
    }
    return undefined;
  }

  public findRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.getPlayerBySocket(socketId)) {
        return room;
      }
    }
    return undefined;
  }

  public getPublicRooms(): RoomInfoPublic[] {
    const list: RoomInfoPublic[] = [];
    for (const room of this.rooms.values()) {
      if (!room.settings.isPrivate && !room.isFull()) {
        list.push(room.toPublicInfo());
      }
    }
    return list;
  }

  public getRandomPublicRoom(): Room | undefined {
    const available = Array.from(this.rooms.values()).filter(
      r => !r.settings.isPrivate && !r.isFull() && r.game.phase === 'LOBBY'
    );
    if (available.length === 0) {
      // fallback to any joinable public room even if game in progress
      const anyAvailable = Array.from(this.rooms.values()).filter(
        r => !r.settings.isPrivate && !r.isFull()
      );
      if (anyAvailable.length === 0) return undefined;
      return anyAvailable[Math.floor(Math.random() * anyAvailable.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  public removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.codeToId.delete(room.code);
      this.rooms.delete(roomId);
      room.destroy();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      // If room is empty or older than 12 hours
      if (room.isEmpty() || now - room.createdAt > 12 * 3600 * 1000) {
        this.removeRoom(id);
      }
    }
  }
}
