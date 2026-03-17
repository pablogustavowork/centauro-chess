
import React, { useEffect, useState, useRef } from 'react';
import { ErrorType, Puzzle, TrainingPriority } from '../types';
import { generateAdaptivePuzzles } from '../services/geminiService';
import { Loader2, Check, X, RefreshCw } from 'lucide-react';

interface TacticalTrainingProps {
  errorType: ErrorType;
  priority?: TrainingPriority;
  onClose: () => void;
}

const TacticalTraining: React.FC<TacticalTrainingProps> = ({ errorType, priority, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'intro' | 'active'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<'solving' | 'correct' | 'incorrect'>('solving');

  useEffect(() => {
    const loadPuzzles = async () => {
      setLoading(true);
      const data = await generateAdaptivePuzzles(errorType);
      setPuzzles(data);
      setLoading(false);
    };
    loadPuzzles();
  }, [errorType]);

  // Sync Iframe with Current Puzzle
  useEffect(() => {
    if (mode === 'active' && puzzles.length > 0 && !loading) {
      const currentPuzzle = puzzles[currentIndex];
      const initIframe = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'LOAD_FEN',
            fen: currentPuzzle.fen
          }, '*');

          iframeRef.current.contentWindow.postMessage({
            type: 'ENABLE_INTERACTION',
            enabled: status === 'solving',
            side: 'w'
          }, '*');
        }
      };
      const timer = setTimeout(initIframe, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, puzzles, loading, status, mode]);

  // Listen for Moves
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MOVE_ATTEMPT') {
        handleMoveAttempt(event.data.san);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentIndex, puzzles, status]);


  const handleMoveAttempt = (san: string) => {
    if (status !== 'solving') return;

    const currentPuzzle = puzzles[currentIndex];

    // Normalize comparison
    const normalize = (s: string) => s.replace(/[+#]/g, '');

    if (normalize(san) === normalize(currentPuzzle.solution)) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  const nextPuzzle = () => {
    if (currentIndex < puzzles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStatus('solving');
    } else {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
        <p>Generando problemas adaptativos para <span className="text-purple-400 font-bold">{errorType}</span>...</p>
        <p className="text-sm text-slate-500 mt-2">Impulsado por Gemini AI</p>
      </div>
    );
  }

  if (puzzles.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400">Error al cargar problemas. Verifica la API Key o intenta de nuevo.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded text-white">Cerrar</button>
      </div>
    );
  }

  // --- INTRO MODE: PROGRAM CARD ---
  if (mode === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4 ring-1 ring-purple-500/50">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Laboratorio de Análisis: Resultados Procesados</h2>
          <p className="text-slate-400">Hemos detectado inconsistencias recurrentes en tus partidas recientes.</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">DIAGNÓSTICO PRINCIPAL</div>
              <div className="text-xl font-bold text-red-400 flex items-center gap-2">
                <X className="w-5 h-5" /> {errorType}
              </div>
              {priority && (
                 <div className="mt-3 flex flex-wrap gap-3">
                   <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                      <div className="text-[10px] text-red-400/70 font-bold uppercase mb-0.5">Impacto</div>
                      <div className="text-sm font-black text-red-400">-{priority.impact} cp</div>
                   </div>
                   <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                      <div className="text-[10px] text-yellow-400/70 font-bold uppercase mb-0.5">Frecuencia</div>
                      <div className="text-sm font-black text-yellow-400">{priority.frequency} rep</div>
                   </div>
                   <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                      <div className="text-[10px] text-blue-400/70 font-bold uppercase mb-0.5">Mejora Esperada</div>
                      <div className="text-sm font-black text-blue-400">{priority.easeOfImprovement}/10</div>
                   </div>
                 </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-800 my-4"></div>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">PLAN DE ENTRENAMIENTO GENERADO</div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Serie de <strong>{puzzles.length} ejercicios</strong> de alta intensidad.</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Enfoque en <strong>{puzzles[0]?.theme || "patrones tácticos"}</strong> y cálculo preciso.</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Objetivo: Reducir la tasa de error en un <strong>15%</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setMode('active')}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> Iniciar Programa Personalizado
        </button>
        <p className="text-center text-xs text-slate-500 mt-4">
          La repetición espaciada es clave para eliminar patrones de error subconscientes.
        </p>
      </div>
    );
  }

  // --- ACTIVE MODE: PUZZLES ---
  const puzzle = puzzles[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-500" />
          Entrenamiento Activo
        </h2>
        <span className="bg-slate-900 text-slate-300 px-3 py-1 rounded-full text-sm font-mono">
          {currentIndex + 1} / {puzzles.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">{puzzle.theme}</span>
            <p className="text-slate-300 mt-2 text-lg italic">"{puzzle.description}"</p>
          </div>

          {status !== 'solving' && (
            <div className={`p-4 rounded-lg mb-4 ${status === 'correct' ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {status === 'correct' ? <Check className="text-green-400" /> : <X className="text-red-400" />}
                <span className={status === 'correct' ? 'text-green-400' : 'text-red-400'}>
                  {status === 'correct' ? '¡Excelente!' : 'Incorrecto'}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Solución: <span className="font-mono text-white">{puzzle.solution}</span>
              </p>
            </div>
          )}

          <button
            onClick={nextPuzzle}
            disabled={status === 'solving'}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            {currentIndex === puzzles.length - 1 ? 'Finalizar Sesión' : 'Siguiente Problema'}
          </button>
        </div>

        <div className="aspect-square w-full max-w-[400px] shadow-xl rounded-lg overflow-hidden border-2 border-slate-600 bg-slate-900">
          <iframe
            ref={iframeRef}
            src="/analysis_board.html"
            className="w-full h-full border-0"
            title="Tablero Entrenamiento"
          />
        </div>
      </div>
    </div>
  );
};

export default TacticalTraining;
