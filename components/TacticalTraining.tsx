
import React, { useEffect, useState, useRef } from 'react';
import { ErrorType, Puzzle } from '../types';
import { generateAdaptivePuzzles } from '../services/geminiService';
import { Loader2, Check, X, RefreshCw } from 'lucide-react';

interface TacticalTrainingProps {
  errorType: ErrorType;
  onClose: () => void;
}

const TacticalTraining: React.FC<TacticalTrainingProps> = ({ errorType, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<'solving' | 'correct' | 'incorrect'>('solving');
  // Removed local game state as logic is delegated to iframe

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
    if (puzzles.length > 0 && !loading) {
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
            side: 'w' // Puzzles usually white to move, or should we detect? 
            // Gemini usually gives 'w' to move. 
            // Ideally we check FEN active color.
          }, '*');
        }
      };
      const timer = setTimeout(initIframe, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, puzzles, loading, status]);

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

  const puzzle = puzzles[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-500" />
          Adaptación Táctica
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
