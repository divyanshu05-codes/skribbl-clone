import { GamePhase, GameStatePayload, CanvasAction } from '../types/game.js';
import { Player } from './Player.js';
import { WordService } from '../services/WordService.js';

export interface GameCallbacks {
  onPhaseChange: (phase: GamePhase, payload: Partial<GameStatePayload>) => void;
  onTimeTick: (timeLeft: number) => void;
  onHintUpdate: (mask: string) => void;
  onRoundEnd: (revealedWord: string, scores: { playerId: string; roundScore: number; totalScore: number }[]) => void;
  onGameOver: (leaderboard: Player[]) => void;
  onSystemMessage: (text: string) => void;
}

export class Game {
  public phase: GamePhase = 'LOBBY';
  public currentRound: number = 0;
  public totalRounds: number = 3;
  public drawTime: number = 80;
  public wordCount: number = 3;
  public hintsCount: number = 2;
  public customWords: string[] = [];
  public wordMode: 'normal' | 'hidden' = 'normal';

  public currentWord: string = '';
  public wordChoices: string[] = [];
  public currentDrawerId: string | null = null;
  public turnOrder: string[] = [];
  public currentTurnIndex: number = -1;

  public timeLeft: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  public revealedIndices: Set<number> = new Set();
  public canvasActions: CanvasAction[] = [];
  public correctGuessCount: number = 0;

  private callbacks: GameCallbacks;

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  public setSettings(settings: {
    rounds: number;
    drawTime: number;
    wordCount: number;
    hintsCount: number;
    customWords: string[];
    wordMode: 'normal' | 'hidden';
  }): void {
    this.totalRounds = Math.max(1, Math.min(10, settings.rounds));
    this.drawTime = Math.max(15, Math.min(240, settings.drawTime));
    this.wordCount = Math.max(1, Math.min(5, settings.wordCount));
    this.hintsCount = Math.max(0, Math.min(5, settings.hintsCount));
    this.customWords = settings.customWords;
    this.wordMode = settings.wordMode;
  }

  public startGame(players: Player[]): void {
    if (players.length < 2) return;
    this.currentRound = 1;
    this.turnOrder = players.map(p => p.id).sort(() => Math.random() - 0.5);
    this.currentTurnIndex = -1;

    players.forEach(p => p.resetGame());
    this.phase = 'STARTING';
    this.timeLeft = 3;

    this.callbacks.onPhaseChange(this.phase, {
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timeLeft: this.timeLeft
    });

    this.startTimer(() => {
      this.nextTurn(players);
    });
  }

  public nextTurn(players: Player[]): void {
    this.clearTimer();
    this.canvasActions = [];
    this.correctGuessCount = 0;
    this.revealedIndices.clear();

    players.forEach(p => p.resetRound());

    this.currentTurnIndex++;
    if (this.currentTurnIndex >= this.turnOrder.length) {
      // Completed a full rotation for this round
      this.currentRound++;
      if (this.currentRound > this.totalRounds) {
        this.endGame(players);
        return;
      }
      this.currentTurnIndex = 0;
    }

    const drawerId = this.turnOrder[this.currentTurnIndex];
    const drawer = players.find(p => p.id === drawerId);

    // If player disconnected, advance to next
    if (!drawer) {
      this.nextTurn(players);
      return;
    }

    this.currentDrawerId = drawer.id;
    drawer.isDrawing = true;

    // Word selection phase (15 seconds to choose)
    this.phase = 'CHOOSING_WORD';
    this.wordChoices = WordService.getRandomWordChoices(this.wordCount, this.customWords);
    this.timeLeft = 15;

    this.callbacks.onPhaseChange(this.phase, {
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      drawerId: drawer.id,
      drawerName: drawer.name,
      timeLeft: this.timeLeft,
      wordChoices: this.wordChoices
    });

    this.startTimer(() => {
      // If drawer didn't choose in time, auto-select the first word
      const autoWord = this.wordChoices[0] || 'apple';
      this.selectWord(autoWord, players);
    });
  }

  public selectWord(word: string, players: Player[]): void {
    if (this.phase !== 'CHOOSING_WORD') return;
    this.clearTimer();

    const cleanWord = word.trim().toLowerCase();
    const isOffered = this.wordChoices.some(w => w.toLowerCase() === cleanWord);
    this.currentWord = isOffered ? cleanWord : (this.wordChoices[0] || 'apple');
    this.phase = 'DRAWING';
    this.timeLeft = this.drawTime;
    this.revealedIndices.clear();

    const drawer = players.find(p => p.id === this.currentDrawerId);

    this.callbacks.onPhaseChange(this.phase, {
      phase: this.phase,
      drawerId: this.currentDrawerId,
      drawerName: drawer?.name || '',
      timeLeft: this.timeLeft,
      wordLength: this.currentWord.length,
      hintMask: WordService.getHintMask(this.currentWord, this.revealedIndices, this.wordMode)
    });

    this.startTimer(() => {
      // Timer ran out
      this.endRound(players, 'Time is up!');
    }, (remaining) => {
      // Hints update on ticks
      this.checkHintProgression(remaining);
    });
  }

  private checkHintProgression(remainingTime: number): void {
    if (this.hintsCount <= 0 || this.wordMode === 'hidden') return;

    const timeElapsed = this.drawTime - remainingTime;
    const interval = this.drawTime / (this.hintsCount + 1);
    const hintsToReveal = Math.floor(timeElapsed / interval);

    if (hintsToReveal > this.revealedIndices.size) {
      this.revealedIndices = WordService.calculateRevealedIndices(
        this.currentWord,
        this.hintsCount,
        hintsToReveal
      );
      const mask = WordService.getHintMask(this.currentWord, this.revealedIndices, this.wordMode);
      this.callbacks.onHintUpdate(mask);
    }
  }

  public handleGuess(
    player: Player,
    guessText: string,
    players: Player[]
  ): { isCorrect: boolean; isClose: boolean; pointsAwarded: number } {
    if (this.phase !== 'DRAWING') return { isCorrect: false, isClose: false, pointsAwarded: 0 };
    if (player.id === this.currentDrawerId) return { isCorrect: false, isClose: false, pointsAwarded: 0 };
    if (player.guessedCurrentRound) return { isCorrect: false, isClose: false, pointsAwarded: 0 };

    const { isCorrect, isClose } = WordService.checkGuess(guessText, this.currentWord);

    if (isCorrect) {
      player.guessedCurrentRound = true;
      this.correctGuessCount++;

      // Scoring formula: faster guess = more points (500 max, 100 min)
      const ratio = Math.max(0.2, this.timeLeft / this.drawTime);
      const points = Math.round(500 * ratio);
      player.addScore(points);

      // Drawer gets 50 bonus points per successful guesser
      const drawer = players.find(p => p.id === this.currentDrawerId);
      if (drawer) {
        drawer.addScore(50);
      }

      // Check if all non-drawers have guessed
      const guessers = players.filter(p => p.id !== this.currentDrawerId);
      const allGuessed = guessers.length > 0 && guessers.every(p => p.guessedCurrentRound);

      if (allGuessed) {
        this.endRound(players, 'All players guessed the word!');
      }

      return { isCorrect: true, isClose: false, pointsAwarded: points };
    }

    return { isCorrect: false, isClose, pointsAwarded: 0 };
  }

  public endRound(players: Player[], reason?: string): void {
    this.clearTimer();
    this.phase = 'ROUND_END';
    this.timeLeft = 5;

    const scoresSummary = players.map(p => ({
      playerId: p.id,
      roundScore: p.roundScore,
      totalScore: p.score
    }));

    this.callbacks.onRoundEnd(this.currentWord, scoresSummary);

    this.startTimer(() => {
      this.nextTurn(players);
    });
  }

  public endGame(players: Player[]): void {
    this.clearTimer();
    this.phase = 'GAME_OVER';
    this.timeLeft = 0;

    const leaderboard = [...players].sort((a, b) => b.score - a.score);
    this.callbacks.onGameOver(leaderboard);
  }

  public addCanvasAction(action: CanvasAction): void {
    if (action.type === 'clear') {
      this.canvasActions = [];
    } else if (action.type === 'undo') {
      this.canvasActions.pop();
    } else {
      this.canvasActions.push(action);
    }
  }

  public handlePlayerDisconnect(playerId: string, players: Player[]): void {
    // If the disconnected player was in the turn order
    this.turnOrder = this.turnOrder.filter(id => id !== playerId);

    if (this.currentDrawerId === playerId && (this.phase === 'CHOOSING_WORD' || this.phase === 'DRAWING')) {
      this.callbacks.onSystemMessage('Drawer disconnected! Moving to next round...');
      this.endRound(players, 'Drawer disconnected');
    }
  }

  private startTimer(onComplete: () => void, onTick?: (timeLeft: number) => void): void {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.callbacks.onTimeTick(this.timeLeft);
      if (onTick) onTick(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.clearTimer();
        onComplete();
      }
    }, 1000);
  }

  public clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public destroy(): void {
    this.clearTimer();
  }
}
