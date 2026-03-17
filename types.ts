
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
  cognitiveCause?: CognitiveCause;
  severity?: Severity;
  features?: MomentFeatures;
  cognitiveScore?: number;
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
  cognitiveAnalysis?: CognitiveAnalysisResult;
}

export type ViewState = 'landing' | 'dashboard' | 'upload' | 'analysis' | 'review' | 'challenge' | 'training' | 'visor' | 'deep_analysis' | 'profile';

// --- COGNITIVE ENGINE V2 TYPES ---

export enum CognitiveCause {
  CEGUERA_TACTICA = 'Ceguera táctica (no vio amenaza)',
  CALCULO_INCOMPLETO = 'Cálculo incompleto (variante corta)',
  MALA_EVALUACION = 'Mala evaluación de la posición',
  PRESION_TIEMPO = 'Error bajo presión de tiempo',
  DESCONOCIMIENTO_APERTURA = 'Falta de conocimiento teórico',
  FALTA_PLAN = 'Ausencia de plan estratégico',
  IMPULSIVIDAD = 'Jugada impulsiva/rápida'
}

export enum Severity {
  LEVE = 'Leve (Imprecisión menor)',
  MODERADA = 'Moderada (Error posicional/táctico recuperable)',
  GRAVE = 'Grave (Pérdida de material o ventaja decisiva)',
  DECISIVA = 'Decisiva (Blunder que pierde la partida)'
}

export interface MomentFeatures {
  engineEvalDelta: number; // CPL
  materialLost: number; // e.g., 3 for a piece
  tacticalComplexity: number; // Heuristic measure (e.g., number of legal captures possible)
  gamePhase: 'apertura' | 'medio_juego' | 'final';
  timeAvailableMs?: number; // Time left on clock if available
  timeSpentMs?: number; // Time spent on the move
}

export interface EnrichedCriticalMoment extends CriticalMoment {
  features: MomentFeatures;
  cognitiveCause: CognitiveCause;
  severity: Severity;
  cognitiveScore: number; // A composite score calculating how bad this is for learning
}

export interface CognitiveProfile {
  recurrentCauses: Record<string, number>; // Maps CognitiveCause to frequency/score
  recurrentTechnical: Record<string, number>; // Maps ErrorType to frequency/score
  weakestPhase: string;
  averageSeverity: number;
}

export interface TrainingPriority {
  cause: CognitiveCause;
  technicalType: ErrorType;
  importanceScore: number; // Higher means train this first
  description: string;
}

export interface TrainingPlan {
  priorities: TrainingPriority[];
  recommendedExercises: any[]; // Placeholder for actual exercise references
}

export interface CognitiveAnalysisResult {
  gamesAnalysis: { gameId: string; pgn: string; criticalMoments: EnrichedCriticalMoment[] }[];
  playerProfile: CognitiveProfile;
  recurrentErrors: Record<string, number>; // Technical errors aggregation
  trainingPriorities: TrainingPriority[];
  trainingPlan: TrainingPlan;
}
