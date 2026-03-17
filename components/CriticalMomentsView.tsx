
import React, { useRef, useEffect } from 'react';
import { GameData, CriticalMoment } from '../types';
import { ArrowRight, AlertTriangle, Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlayCircle } from 'lucide-react';


interface CriticalMomentsViewProps {
  game: GameData;
  onStartChallenge: (moment: CriticalMoment) => void;
}

const CriticalMomentsView: React.FC<CriticalMomentsViewProps> = ({ game, onStartChallenge }) => {
  const [currentPly, setCurrentPly] = React.useState(0);
  const [maxPly, setMaxPly] = React.useState(0);
  // Add state for current SAN to display in Laboratory
  const [currentSan, setCurrentSan] = React.useState("");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for Iframe State Updates (Laboratory Sync)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STATE_UPDATE') {
        // Update local state to match valid iframe state
        // We trust iframe ply more than local if they diverge, but mostly we want the SAN
        setCurrentSan(event.data.san);
        // Option: Verify ply sync? 
        // setCurrentPly(event.data.ply);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // We maintain a local history LENGTH just for the progress bar, 
  // but we trust the iframe for the actual moves list.
  // Actually, we need to know maxPly to enable/disable buttons.
  // We can roughly estimate it from game.criticalMoments (last moment moveNumber * 2 approx)
  // OR we can parse it quickly just for the count.
  // Let's use clean parsing just to get the *count* of moves for the slider.
  useEffect(() => {
    // Estimate max ply or parse simply
    // Quick naive parse for move count
    const matches = game.pgn.match(/\d+\./g);
    if (matches) {
      // If last match is "30.", then approx 60 plies. 
      // This is inexact.
      // Better: Wait for iframe to tell us? 
      // For now, let's assume a reasonable upper bound or use the previously functioning simple logic just for COUNT.
      // Actually, we can just let the user click 'Next' until it stops updating.
      // But 'disabled' state requires knowledge.
      // Let's try to get it from the legacy logic used in service if possible.
      // Or just relax the button disabled state.
      if (game.criticalMoments.length > 0) {
        const lastMoment = game.criticalMoments[game.criticalMoments.length - 1];
        setMaxPly(Math.max(100, lastMoment.ply + 50)); // heuristic
      } else {
        setMaxPly(200);
      }
    }
  }, [game.pgn]);


  // Send PGN to Iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'LOAD_PGN',
          pgn: game.pgn
        }, '*');
      }
    }, 500); // Wait for iframe load
    return () => clearTimeout(timer);
  }, [game.pgn]);

  // Sync Ply
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'GOTO_MOVE',
        index: currentPly - 1 // 0-based index for logic, currentPly is 1-based (0 is start)
      }, '*');
    }
  }, [currentPly]);

  // Derived state for current move text using synced Iframe data
  const currentMoveText = React.useMemo(() => {
    if (currentPly === 0) return "Inicio";
    if (!currentSan) return `Jugada ${currentPly}`; // Fallback

    const moveNum = Math.ceil(currentPly / 2);
    const isWhite = currentPly % 2 !== 0;
    return `${moveNum}. ${isWhite ? '' : '...'}${currentSan}`;
  }, [currentPly, currentSan]);


  const goToPly = (ply: number) => {
    setCurrentPly(Math.max(0, ply)); // Allow going up indefinitely (iframe handles bounds)
  };

  const selectedMoment = game.criticalMoments.find(m => m.ply === currentPly);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left: Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
            <Activity className="w-5 h-5" />
            Informe del Laboratorio
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400">CPL Promedio</span>
              <span className={`font - mono font - bold text - xl ${game.averageCpl < 30 ? 'text-green-400' : 'text-red-400'} `}>
                {game.averageCpl}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400">Error Dominante</span>
              <span className="font-medium text-orange-300 text-right">{game.dominantError}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Jugadores</span>
              <span className="text-sm text-right text-slate-300">{game.white} vs {game.black}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Momentos Críticos
          </h3>
          <div className="space-y-3">
            {game.criticalMoments.map((moment, idx) => (
              <div
                key={idx}
                className={`p - 4 rounded - lg border transition - all cursor - pointer ${moment.ply === currentPly
                  ? 'bg-green-900/20 border-green-500 ring-1 ring-green-500'
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500'
                  } `}
                onClick={() => goToPly(moment.ply)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-mono text-slate-400">Jugada {moment.moveNumber}</span>
                    {moment.cognitiveCause && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 max-w-[180px] truncate">
                        {moment.cognitiveCause}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-red-500 bg-red-950/30 px-2 py-1 rounded">
                      -{moment.deltaElo} ELO
                    </span>
                    {moment.errorType && (
                       <span className="text-[10px] text-orange-400 font-medium uppercase tracking-wider">
                         {moment.errorType}
                       </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="text-slate-300">Tú: <strong className="text-red-400">{moment.movePlayed}</strong></span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300">Motor: <strong className="text-green-400">{moment.bestMove}</strong></span>
                </div>
                <button
                  onClick={() => onStartChallenge(moment)}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Entrar al Gimnasio
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Board Visualization via IFRAME (Robust) */}
      <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-[500px] w-full aspect-square relative bg-slate-900 rounded-lg overflow-hidden border border-slate-600">
          <iframe
            ref={iframeRef}
            src="/analysis_board.html"
            className="w-full h-full border-0"
            title="Tablero de Análisis"
          />
        </div>

        {/* Playback Controls */}
        <div className="w-full max-w-[400px] mt-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex flex-col gap-2">

          {/* Move Indicator */}
          <div className="text-center font-mono text-lg font-bold text-green-400">
            {/* Estimation */}
            Jugada: {Math.ceil(currentPly / 2)}
          </div>

          <div className="flex items-center justify-between gap-1">
            <button onClick={() => goToPly(0)} disabled={currentPly === 0} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronsLeft className="w-6 h-6 text-white" />
            </button>
            <button onClick={() => goToPly(currentPly - 1)} disabled={currentPly === 0} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button onClick={() => goToPly(currentPly + 1)} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            <button onClick={() => goToPly(999)} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronsRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {selectedMoment ? (
          <div className="mt-6 text-center max-w-md animate-in fade-in slide-in-from-bottom-2">
            <span className="inline-block px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-red-400 text-xs font-bold mb-2">
              Momento Crítico Identificado
            </span>
            <p className="text-slate-300">
              <span className="block font-bold text-lg mb-2 text-white">Jugada {selectedMoment.moveNumber}</span>
              Analiza la posición y encuentra la mejora.
            </p>
            <button
              onClick={() => onStartChallenge(selectedMoment)}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <PlayCircle className="w-5 h-5" /> Comenzar Desafío
            </button>
          </div>
        ) : (
          <p className="mt-6 text-slate-400 text-sm text-center max-w-md">
            Navega por la partida o selecciona un momento crítico de la lista para analizar.
          </p>
        )}
      </div>
    </div>
  );
};


export default CriticalMomentsView;
