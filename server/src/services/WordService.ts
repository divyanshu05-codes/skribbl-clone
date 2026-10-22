import { wordsData } from '../data/words.js';

export class WordService {
  private static allWords: string[] = [];
  private static categories: Record<string, string[]> = wordsData;

  static {
    // Flatten all words into a unified list
    const set = new Set<string>();
    Object.values(wordsData).forEach(list => {
      list.forEach(w => set.add(w.toLowerCase().trim()));
    });
    this.allWords = Array.from(set);
  }

  /**
   * Get random word choices for the drawer.
   * If custom words are provided by room settings, mix or select from them.
   */
  public static getRandomWordChoices(count: number = 3, customWords: string[] = []): string[] {
    const validCustom = customWords
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2 && w.length <= 30);

    const pool = validCustom.length > 0 
      ? [...validCustom, ...this.allWords]
      : this.allWords;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen: string[] = [];

    for (const word of shuffled) {
      if (!chosen.includes(word)) {
        chosen.push(word);
      }
      if (chosen.length >= count) break;
    }

    return chosen.length > 0 ? chosen : ['cat', 'house', 'tree'];
  }

  /**
   * Generate hint mask based on word and revealed indices.
   * Format: letters separated by spaces, e.g. "_ l _ _ _ a _ _"
   */
  public static getHintMask(word: string, revealedIndices: Set<number>, wordMode: 'normal' | 'hidden' = 'normal'): string {
    if (wordMode === 'hidden') {
      return '???';
    }

    const chars = word.split('');
    const mask = chars.map((char, index) => {
      if (char === ' ') return '  ';
      if (char === '-' || char === '\'') return char;
      if (revealedIndices.has(index)) return char;
      return '_';
    });

    return mask.join(' ');
  }

  /**
   * Calculate indices of letters to reveal based on time elapsed and allowed hints count.
   */
  public static calculateRevealedIndices(
    word: string,
    hintsAllowed: number,
    hintsRevealedCount: number
  ): Set<number> {
    const indices = new Set<number>();
    const eligibleIndices: number[] = [];

    for (let i = 0; i < word.length; i++) {
      if (word[i] !== ' ' && word[i] !== '-' && word[i] !== '\'') {
        eligibleIndices.push(i);
      }
    }

    // Limit maximum hints to not reveal more than 50% of the word
    const maxPossibleHints = Math.min(
      hintsAllowed,
      Math.floor(eligibleIndices.length * 0.5)
    );

    const actualToReveal = Math.min(hintsRevealedCount, maxPossibleHints);

    // Deterministic pseudo-random based on word length and letters so all clients get consistent hints
    const sortedEligible = [...eligibleIndices].sort((a, b) => {
      const hashA = (a * 31 + word.charCodeAt(a)) % 97;
      const hashB = (b * 31 + word.charCodeAt(b)) % 97;
      return hashA - hashB;
    });

    for (let i = 0; i < actualToReveal; i++) {
      indices.add(sortedEligible[i]);
    }

    return indices;
  }

  /**
   * Check guess against word.
   * Returns: { isCorrect, isClose }
   */
  public static checkGuess(guess: string, targetWord: string): { isCorrect: boolean; isClose: boolean } {
    const cleanGuess = guess.trim().toLowerCase();
    const cleanTarget = targetWord.trim().toLowerCase();

    if (!cleanGuess || !cleanTarget) {
      return { isCorrect: false, isClose: false };
    }

    if (cleanGuess === cleanTarget) {
      return { isCorrect: true, isClose: false };
    }

    // Check Levenshtein distance for "close guess" tip
    const distance = this.levenshtein(cleanGuess, cleanTarget);
    const isClose = distance === 1 && cleanTarget.length >= 4;

    return { isCorrect: false, isClose };
  }

  /**
   * Levenshtein distance algorithm
   */
  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
