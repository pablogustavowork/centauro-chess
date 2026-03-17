import { 
  GameData, 
  CriticalMoment, 
  ErrorType, 
  EnrichedCriticalMoment, 
  CognitiveCause, 
  Severity, 
  MomentFeatures, 
  CognitiveAnalysisResult, 
  CognitiveProfile, 
  TrainingPriority, 
  TrainingPlan 
} from '../types';

/**
 * CentaUros Cognitive Engine Core
 * Implementation of the pedagogical diagnosis algorithm.
 */

export function extract_features(moment: CriticalMoment, game: GameData): MomentFeatures {
  // En una versión completa esto requiere analizar el tablero (FEN) para ver táctica,
  // material, etc. Aquí usamos heurísticas basadas en la información actual.
  let gamePhase: 'apertura' | 'medio_juego' | 'final' = 'medio_juego';
  if (moment.moveNumber <= 12) gamePhase = 'apertura';
  else if (moment.moveNumber > 35) gamePhase = 'final';

  return {
    engineEvalDelta: moment.cpl,
    materialLost: moment.cpl > 250 ? 3 : (moment.cpl > 100 ? 1 : 0), // Heurística aproximada
    tacticalComplexity: Math.floor(Math.random() * 10), // Placeholder para complejidad
    gamePhase,
    timeAvailableMs: undefined, // Requiere PGN clock times
    timeSpentMs: undefined
  };
}

export function classify_technical_error(features: MomentFeatures): ErrorType {
  if (features.gamePhase === 'apertura' && features.engineEvalDelta > 50 && features.engineEvalDelta < 150) {
    return ErrorType.APERTURA;
  }
  if (features.engineEvalDelta > 300) {
    return ErrorType.TACTICA;
  }
  if (features.engineEvalDelta > 100 && features.engineEvalDelta <= 300) {
    return ErrorType.ESTRATEGIA;
  }
  if (features.gamePhase === 'final') {
    return ErrorType.FINALES;
  }
  return ErrorType.MINOR; // Fallback
}

export function classify_cognitive_cause(features: MomentFeatures, technicalError: ErrorType): CognitiveCause {
  if (technicalError === ErrorType.TACTICA && features.materialLost > 0) {
    return CognitiveCause.CEGUERA_TACTICA;
  }
  if (technicalError === ErrorType.ESTRATEGIA) {
    return CognitiveCause.MALA_EVALUACION;
  }
  if (technicalError === ErrorType.APERTURA) {
    return CognitiveCause.DESCONOCIMIENTO_APERTURA;
  }
  if (features.timeSpentMs && features.timeSpentMs < 3000 && features.engineEvalDelta > 100) {
    return CognitiveCause.IMPULSIVIDAD;
  }
  if (features.timeAvailableMs && features.timeAvailableMs < 20000 && features.engineEvalDelta > 150) {
    return CognitiveCause.PRESION_TIEMPO;
  }
  
  return CognitiveCause.CALCULO_INCOMPLETO; // Default fallback for major errors
}

export function classify_severity(features: MomentFeatures): Severity {
  if (features.engineEvalDelta > 500) return Severity.DECISIVA;
  if (features.engineEvalDelta > 200) return Severity.GRAVE;
  if (features.engineEvalDelta > 80) return Severity.MODERADA;
  return Severity.LEVE;
}

export function compute_error_score(features: MomentFeatures, errorType: ErrorType, cause: CognitiveCause, severity: Severity): number {
  // Score de importancia pedagógica (0 a 100)
  // Cuanto mayor sea el score, más prioritario es entrenarlo.
  let baseScore = features.engineEvalDelta / 10;
  
  if (severity === Severity.DECISIVA) baseScore += 30;
  else if (severity === Severity.GRAVE) baseScore += 15;

  // Errores repetitivos o sistémicos (ej. no ver táctica básica) puntúan alto
  if (cause === CognitiveCause.CEGUERA_TACTICA) baseScore *= 1.5;
  if (cause === CognitiveCause.IMPULSIVIDAD) baseScore *= 1.2;

  return Math.min(100, Math.round(baseScore));
}

export function aggregate_patterns(analyzed_games: { gameId: string, pgn: string, criticalMoments: EnrichedCriticalMoment[] }[]): {
  causesCount: Record<string, number>,
  technicalCount: Record<string, number>,
  phaseCount: Record<string, number>,
  totalSeverity: number,
  momentCount: number
} {
  const causesCount: Record<string, number> = {};
  const technicalCount: Record<string, number> = {};
  const phaseCount: Record<string, number> = { 'apertura': 0, 'medio_juego': 0, 'final': 0 };
  let totalSeverity = 0;
  let momentCount = 0;

  analyzed_games.forEach(g => {
    g.criticalMoments.forEach(m => {
      causesCount[m.cognitiveCause] = (causesCount[m.cognitiveCause] || 0) + 1;
      technicalCount[m.errorType] = (technicalCount[m.errorType] || 0) + 1;
      phaseCount[m.features.gamePhase]++;
      
      const sevVal = m.severity === Severity.DECISIVA ? 4 : m.severity === Severity.GRAVE ? 3 : m.severity === Severity.MODERADA ? 2 : 1;
      totalSeverity += sevVal;
      momentCount++;
    });
  });

  return { causesCount, technicalCount, phaseCount, totalSeverity, momentCount };
}

export function build_player_profile(pattern_stats: any): CognitiveProfile {
  let weakestPhase = 'medio_juego';
  let maxPhaseErr = -1;
  Object.keys(pattern_stats.phaseCount).forEach(phase => {
    if (pattern_stats.phaseCount[phase] > maxPhaseErr) {
      maxPhaseErr = pattern_stats.phaseCount[phase];
      weakestPhase = phase;
    }
  });

  return {
    recurrentCauses: pattern_stats.causesCount,
    recurrentTechnical: pattern_stats.technicalCount,
    weakestPhase,
    averageSeverity: pattern_stats.momentCount > 0 ? pattern_stats.totalSeverity / pattern_stats.momentCount : 0
  };
}

export function detect_recurrent_errors(pattern_stats: any): Record<string, number> {
  // Umbralización para considerar repetitivo
  const recurrent: Record<string, number> = {};
  Object.entries(pattern_stats.technicalCount).forEach(([type, count]) => {
    if (typeof count === 'number' && count > 2) { 
      recurrent[type] = count;
    }
  });
  return recurrent;
}

export function prioritize_training(recurrent_errors: Record<string, number>, profile: CognitiveProfile, pattern_stats: any): TrainingPriority[] {
  const priorities: TrainingPriority[] = [];

  // Buscar el emparejamiento más mortal: Causa + Carencia Técnica
  Object.keys(profile.recurrentCauses).forEach(cause => {
    Object.keys(profile.recurrentTechnical).forEach(tech => {
       // Cálculo muy heurístico de prioridad
       const freqCause = profile.recurrentCauses[cause] || 0;
       const freqTech = profile.recurrentTechnical[tech] || 0;
       
       if (freqCause > 0 && freqTech > 0) {
         let importance = (freqCause + freqTech) * 10;
         
         // Cast keys back to Enums to properly assign to interfaces
         priorities.push({
           cause: cause as CognitiveCause,
           technicalType: tech as ErrorType,
           importanceScore: importance,
           description: `Entrenamiento principal para ${cause} resolviendo problemas de ${tech}`
         });
       }
    });
  });

  return priorities.sort((a, b) => b.importanceScore - a.importanceScore).slice(0, 3);
}

export function generate_training_plan(priorities: TrainingPriority[]): TrainingPlan {
  // Map priorities to exercises.
  return {
    priorities,
    recommendedExercises: [] // Lógica futura: consultar DB de táctica/estrategia
  };
}

/**
 * Función Principal del Motor Cognitivo.
 * Toma los datos resultantes del análisis de Stockfish (GameData) 
 * y les aplica la pedagogía de CentaUrosChess.
 */
export function analyze_player_games(games: GameData[]): CognitiveAnalysisResult {
  const analyzed_games = [];

  for (const game of games) {
    const enriched_moments: EnrichedCriticalMoment[] = [];

    // Momentos generados por el motor en AnalysisService
    for (let i = 0; i < game.criticalMoments.length; i++) {
      const moment = game.criticalMoments[i];
      const features = extract_features(moment, game);
      const error_type = classify_technical_error(features);
      const cognitive_cause = classify_cognitive_cause(features, error_type);
      const severity = classify_severity(features);
      const score = compute_error_score(features, error_type, cognitive_cause, severity);

      // Mutate the original moment so UI components reading game.criticalMoments see it
      moment.errorType = error_type;
      moment.features = features;
      moment.cognitiveCause = cognitive_cause;
      moment.severity = severity;
      moment.cognitiveScore = score;

      enriched_moments.push(moment as EnrichedCriticalMoment);
    }

    analyzed_games.push({
      gameId: game.id,
      pgn: game.pgn,
      criticalMoments: enriched_moments
    });
  }

  const pattern_stats = aggregate_patterns(analyzed_games);
  const player_profile = build_player_profile(pattern_stats);
  const recurrent_errors = detect_recurrent_errors(pattern_stats);
  const training_priorities = prioritize_training(recurrent_errors, player_profile, pattern_stats);
  const training_plan = generate_training_plan(training_priorities);

  return {
    gamesAnalysis: analyzed_games,
    playerProfile: player_profile,
    recurrentErrors: recurrent_errors,
    trainingPriorities: training_priorities,
    trainingPlan: training_plan
  };
}
