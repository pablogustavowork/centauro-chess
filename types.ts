
export interface UserProfile {
  name: string;
  elo: number;
}

export enum ErrorType {
  TACTICAL_GRAVE = 'Error Táctico Grave', // CPL > 300
  POSITIONAL_STRONG = 'Error Posicional Fuerte', // CPL 100-300
  OPENING_IMPRECISION = 'Imprecisión de Apertura', // CPL 50-100 (Moves < 12)
  MINOR = 'Imprecisión Menor'
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
}

export interface Puzzle {
  fen: string;
  solution: string; // SAN or LAN
  theme: string;
  description: string;
}

export type ViewState = 'landing' | 'dashboard' | 'upload' | 'analysis' | 'challenge' | 'training' | 'visor';
