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
  TrainingPlan,
  PlayingStyle
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
    return CognitiveCause.NO_VIO_AMENAZA;
  }
  if (technicalError === ErrorType.ESTRATEGIA) {
    return CognitiveCause.MALA_EVALUACION;
  }
  if (technicalError === ErrorType.APERTURA) {
    return CognitiveCause.JUGADA_AUTOMATICA; // Aproximacion a jugar de memoria sin pensar
  }
  if (features.timeSpentMs && features.timeSpentMs < 3000 && features.engineEvalDelta > 100) {
    return CognitiveCause.JUGO_RAPIDO;
  }
  if (features.timeAvailableMs && features.timeAvailableMs < 20000 && features.engineEvalDelta > 150) {
    return CognitiveCause.COLAPSO_PRESION;
  }
  if (features.engineEvalDelta > 400 && features.gamePhase === 'apertura') {
     return CognitiveCause.EXCESO_CONFIANZA;
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
  if (cause === CognitiveCause.NO_VIO_AMENAZA) baseScore *= 1.5;
  if (cause === CognitiveCause.JUGO_RAPIDO) baseScore *= 1.2;

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

  // Simple heuristic to determine playing style based on errors
  let playingStyle = PlayingStyle.SOLIDO;
  const tErr = pattern_stats.technicalCount[ErrorType.TACTICA] || 0;
  const sErr = pattern_stats.technicalCount[ErrorType.ESTRATEGIA] || 0;
  
  if (tErr > sErr * 2) {
      playingStyle = PlayingStyle.AGRESIVO; // Mucha tactica fallida -> juega sharp
  } else if (sErr > tErr * 2) {
      playingStyle = PlayingStyle.POSICIONAL; 
  } else if ((pattern_stats.causesCount[CognitiveCause.EXCESO_CONFIANZA] || 0) > 2) {
      playingStyle = PlayingStyle.ESPECULATIVO;
  } else if (tErr > 3) {
      playingStyle = PlayingStyle.TACTICO;
  }

  return {
    recurrentCauses: pattern_stats.causesCount,
    recurrentTechnical: pattern_stats.technicalCount,
    weakestPhase,
    averageSeverity: pattern_stats.momentCount > 0 ? pattern_stats.totalSeverity / pattern_stats.momentCount : 0,
    playingStyle
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

export function prioritize_training(analyzed_games: { gameId: string, pgn: string, criticalMoments: EnrichedCriticalMoment[] }[], profile: CognitiveProfile): TrainingPriority[] {
  const priorities: TrainingPriority[] = [];

  // Group by Cause + ErrorType
  const pairings: Record<string, {
    count: number;
    totalImpact: number;
    totalSeveritySum: number;
    cause: CognitiveCause;
    tech: ErrorType;
  }> = {};

  analyzed_games.forEach(game => {
    game.criticalMoments.forEach(m => {
      const key = `${m.cognitiveCause}|${m.errorType}`;
      if (!pairings[key]) {
        pairings[key] = { count: 0, totalImpact: 0, totalSeveritySum: 0, cause: m.cognitiveCause, tech: m.errorType };
      }
      pairings[key].count += 1;
      pairings[key].totalImpact += m.features.engineEvalDelta;
      
      let sevVal = 1;
      if (m.severity === Severity.MODERADA) sevVal = 2;
      else if (m.severity === Severity.GRAVE) sevVal = 3;
      else if (m.severity === Severity.DECISIVA) sevVal = 4;
      pairings[key].totalSeveritySum += sevVal;
    });
  });

  Object.values(pairings).forEach(pair => {
    // Subjective heuristic for ease of improvement based on cause
    let ease = 5; 
    if (pair.cause === CognitiveCause.JUGADA_AUTOMATICA || pair.cause === CognitiveCause.JUGO_RAPIDO) ease = 8; // Easier to fix (play slower)
    if (pair.cause === CognitiveCause.CALCULO_INCOMPLETO || pair.cause === CognitiveCause.MALA_EVALUACION) ease = 3; // Harder to fix

    const freq = pair.count;
    const impact = pair.totalImpact / freq; // Average CPL
    const avgSev = pair.totalSeveritySum / freq;
    
    // Cost heuristic
    const cost = Math.round((impact / 10) * avgSev);

    // Score calculation
    const importance = Math.round((freq * 15) + cost + (ease * 3));

    priorities.push({
      cause: pair.cause,
      technicalType: pair.tech,
      importanceScore: importance,
      description: `Entrenamiento para ${pair.cause} resolviendo problemas de ${pair.tech}`,
      frequency: freq,
      impact: Math.round(impact),
      pressureFactor: pair.cause === CognitiveCause.COLAPSO_PRESION ? 1 : 0, // Simplified
      easeOfImprovement: ease,
      cost
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
  const training_priorities = prioritize_training(analyzed_games, player_profile);
  const training_plan = generate_training_plan(training_priorities);

  return {
    gamesAnalysis: analyzed_games,
    playerProfile: player_profile,
    recurrentErrors: recurrent_errors,
    trainingPriorities: training_priorities,
    trainingPlan: training_plan
  };
}
