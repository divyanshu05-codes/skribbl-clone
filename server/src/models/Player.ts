import { AvatarConfig, PlayerData } from '../types/game.js';

export class Player {
  public readonly id: string;
  public socketId: string;
  public name: string;
  public avatar: AvatarConfig;
  public score: number = 0;
  public roundScore: number = 0;
  public isHost: boolean = false;
  public isDrawing: boolean = false;
  public guessedCurrentRound: boolean = false;
  public guessedAtTime: number = 0;
  public isReady: boolean = false;

  constructor(id: string, socketId: string, name: string, avatar: AvatarConfig, isHost: boolean = false) {
    this.id = id;
    this.socketId = socketId;
    this.name = name.trim().slice(0, 20) || 'Doodler';
    this.avatar = avatar;
    this.isHost = isHost;
  }

  public resetRound(): void {
    this.isDrawing = false;
    this.guessedCurrentRound = false;
    this.roundScore = 0;
    this.guessedAtTime = 0;
  }

  public addScore(points: number): void {
    this.roundScore += points;
    this.score += points;
  }

  public resetGame(): void {
    this.score = 0;
    this.resetRound();
    this.isReady = false;
  }

  public toJSON(): PlayerData {
    return {
      id: this.id,
      socketId: this.socketId,
      name: this.name,
      avatar: this.avatar,
      score: this.score,
      isHost: this.isHost,
      isDrawing: this.isDrawing,
      guessedCurrentRound: this.guessedCurrentRound,
      roundScore: this.roundScore,
      isReady: this.isReady
    };
  }
}
