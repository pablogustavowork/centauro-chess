
export interface UserProfile {
  name: string;
  elo: number;
}

export enum ErrorType {
  // Legacy
  TACTICAL_GRAVE = 'Error Táctico Grave', // CPL > 300
  POSITIONAL_STRONG = 'Error Posicional Fuerte', // CPL 100-300
  OPENING_IMPRECISION = 'Imprecisión de Apertura', // CPL 50-100 (Moves < 12)
  MINOR = 'Imprecisión Menor',
  // New V2 technical types
  TACTICA = 'táctica',
  CALCULO = 'cálculo',
  ESTRATEGIA = 'estrategia',
  DEFENSA = 'defensa',
  APERTURA = 'apertura',
  FINALES = 'finales',
  MANEJO_TIEMPO = 'manejo del tiempo'
}

export interface PlayerStats {
  tactica: number;
  calculo: number;
  estrategia: number;
  defensa: number;
  apertura: number;
  finales: number;
  manejoTiempo: number;
}

export interface AnalysisResult {
  moveNumber: number;
  fen: string;
  ply: number; // Half-move number
  movePlayed: string; // SAN
  bestMove: string; // SAN
  cpl: number; // Centipawn loss
  mateIn?: number;
  isWhite: boolean;
}

export interface CriticalMoment extends AnalysisResult {
  deltaElo: number;
  description: string;
  errorType: ErrorType;
}


export interface EvalPoint {
  ply: number;
  score: number; // Centipawns (White perspective)
}

export interface ClassificationCounts {
  brilliant: number;
  great: number;
  best: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
}

export interface GameData {
  id: string;
  white: string;
  black: string;
  date: string;
  result: string;
  pgn: string;
  averageCpl: number;
  criticalMoments: CriticalMoment[];
  dominantError: ErrorType;

  // Phase 2: Game Review Data
  accuracy?: { white: number; black: number };
  evalHistory?: EvalPoint[];
  classifications?: { white: ClassificationCounts; black: ClassificationCounts };
}

export interface Puzzle {
  fen: string;
  solution: string; // SAN or LAN
  theme: string;
  description: string;
}



export interface BatchAnalysisResult {
  username: string;
  gamesCount: number;
  averageCpl: number;
  dominantError: ErrorType;
  accuracyTrend: number[]; // Accuracy of each game
  errorDistribution: { [key in ErrorType]: number };
  games: GameData[];
}

export type ViewState = 'landing' | 'dashboard' | 'upload' | 'analysis' | 'review' | 'challenge' | 'training' | 'visor' | 'deep_analysis' | 'profile';

