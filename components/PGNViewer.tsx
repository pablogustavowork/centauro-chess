import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, SkipBack, ChevronLeft, ChevronRight, SkipForward, AlertCircle } from 'lucide-react';
import { Chess } from 'chess.js';
import OpeningLibrary from './OpeningLibrary';
import AnalysisPanel from './AnalysisPanel';
import { initEngine, evaluatePosition, EngineEvaluation } from '../services/analysisService';

interface PGNViewerProps {
    onBack: () => void;
    initialPgn?: string;
    savedGames?: any[]; // using any for now, since GameData is in types
}

const PGNViewer: React.FC<PGNViewerProps> = ({ onBack, initialPgn, savedGames }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [gameState, setGameState] = useState(new Chess());
    const [currentPly, setCurrentPly] = useState<number>(0);
    const [history, setHistory] = useState<string[]>([]);

    // Engine State
    const engineWorker = useRef<Worker | null>(null);
    const [evaluation, setEvaluation] = useState<{ cp: number, mate?: number } | null>({ cp: 0 });
    const [bestMove, setBestMove] = useState<string | undefined>(undefined);
    const [isThinking, setIsThinking] = useState(false);

    // Mode State
    const [mode, setMode] = useState<'view' | 'play'>('view');
    const [playerSide, setPlayerSide] = useState<'w' | 'b'>('w');

    // Initialize Engine
    useEffect(() => {
        createWorker().then(worker => {
            initEngine(worker).then(readyWorker => {
                engineWorker.current = readyWorker;
            });
        });
        return () => {
            engineWorker.current?.terminate();
        };
    }, []);

    const createWorker = async () => new Worker('/stockfish.js');

    // Load Initial PGN
    useEffect(() => {
        if (initialPgn) {
            loadPgn(initialPgn);
        }
    }, [initialPgn]);

    const loadPgn = (pgn: string) => {
        if (!pgn) return;

        // Clean PGN
        const cleanPgn = pgn.trim();

        try {
            const newGame = new Chess();
            let success = false;

            try {
                // 1. Try standard load
                newGame.loadPgn(cleanPgn);
                success = true;
            } catch (e) {
                console.warn("Standard loadPgn failed, trying fallback 1 (Strip Headers):", e);
                try {
                    // 2. Fallback: Strip headers, just load moves
                    // Remove all [...] blocks and trim
                    const movesOnly = cleanPgn.replace(/\[.*?\]/g, "").trim();
                    if (movesOnly) {
                        newGame.loadPgn(movesOnly);
                        success = true;
                    }
                } catch (e2) {
                    console.warn("Fallback 1 failed, trying legacy:", e2);
                    try {
                        // 3. Fallback: Legacy load_pgn (if method exists)
                        // @ts-ignore
                        if (newGame.load_pgn) {
                            // @ts-ignore
                            newGame.load_pgn(cleanPgn);
                            success = true;
                        }
                    } catch (e3) {
                        console.error("All PGN load methods failed:", e3);
                    }
                }
            }

            if (success) {
                const history = newGame.history();
                setGameState(newGame);
                setHistory(history);
                setCurrentPly(history.length);
                setMode('view');

                // Safe post message
                setTimeout(() => {
                    postMessage({ type: 'LOAD_PGN', pgn: cleanPgn });
                }, 100);
            } else {
                alert("Error al cargar PGN. Verifique el formato.");
            }
        } catch (e) {
            console.error("Critical PGN Error", e);
            alert("Error crítico al procesar PGN.");
        }
    };

    const postMessage = (msg: any) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(msg, '*');
        }
    };

    // Coach Comment State
    const [coachComment, setCoachComment] = useState<string>("Inicia la partida o carga un PGN para comenzar.");

    // Analyze current position
    useEffect(() => {
        if (engineWorker.current && !gameState.game_over()) {
            // If play mode and computer turn, move
            if (mode === 'play' && ((gameState.turn() === 'w' && playerSide === 'b') || (gameState.turn() === 'b' && playerSide === 'w'))) {
                makeComputerMove();
            } else {
                // Determine evaluation for current position (View or Play-UserTurn)
                setIsThinking(true);
                const fen = gameState.fen();
                evaluatePosition(engineWorker.current, fen, 15).then(result => {
                    setEvaluation({ cp: result.cp, mate: result.mate });
                    setBestMove(result.bestMove);
                    setIsThinking(false);

                    // Generate Simple Comment
                    generateComment(result, gameState.turn());
                });
            }
        }
    }, [gameState, mode, playerSide]);

    const generateComment = (evalResult: EngineEvaluation, turn: 'w' | 'b') => {
        // Simple logic mainly for demo
        const score = evalResult.cp;
        const absScore = Math.abs(score);

        let msg = "";

        if (evalResult.mate) {
            msg = `Mate en ${Math.abs(evalResult.mate)}. ¡El final está cerca!`;
        } else if (absScore < 50) {
            msg = "Posición igualada. Ambos bandos tienen oportunidades.";
        } else if (absScore < 150) {
            msg = "Ligera ventaja. Controla el centro y busca debilidades.";
        } else if (absScore < 300) {
            msg = "Ventaja clara. Presiona para materializarla.";
        } else {
            msg = "Ventaja decisiva. Busca el remate.";
        }

        if (bestMove) {
            msg += ` Considera ${bestMove} como continuación sólida.`;
        }

        setCoachComment(msg);
    };

    const makeComputerMove = async () => {
        if (!engineWorker.current) return;
        setIsThinking(true);
        // Deeper search for move
        const result = await evaluatePosition(engineWorker.current, gameState.fen(), 18);
        setEvaluation({ cp: result.cp, mate: result.mate });

        if (result.bestMove) {
            const move = gameState.move(result.bestMove, { sloppy: true });
            if (move) {
                updateGameState(gameState);
                postMessage({ type: 'LOAD_FEN', fen: gameState.fen() });
                setCoachComment(`He jugado ${move.san}. ${result.cp > 0 ? 'Siento que voy ganando.' : 'Interesante posición.'}`);
            }
        }
        setIsThinking(false);
    };

    const updateGameState = (game: Chess) => {
        const newGame = new Chess(game.fen()); // Clone
        setGameState(newGame);
        setHistory(game.history());
        setCurrentPly(game.history().length);
    };

    // Message Listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (data.type === 'MOVE_ATTEMPT') {
                try {
                    const move = gameState.move({
                        from: data.source,
                        to: data.target,
                        promotion: data.promotion || 'q'
                    });

                    if (move) {
                        updateGameState(gameState);
                    } else {
                        // invalid logic handled by board snapback usually
                    }
                } catch (e) {
                    postMessage({ type: 'LOAD_FEN', fen: gameState.fen() });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [gameState]);

    const toggleMode = (newMode: 'view' | 'play') => {
        setMode(newMode);
        if (newMode === 'play') {
            postMessage({ type: 'ENABLE_INTERACTION', enabled: true, side: playerSide });
        } else {
            postMessage({ type: 'ENABLE_INTERACTION', enabled: false });
        }
    };

    // Navigation handlers
    const navTo = (ply: number) => {
        if (mode === 'play') return;

        // Update Internal State to match Ply
        // We need to re-create the game object at this ply to get correct FEN for evaluation
        // This is tricky without full PGN re-play.
        // Assuming 'history' has all moves.
        const tempGame = new Chess();
        // Load initial if needed? Assuming standard start.
        for (let i = 0; i < ply; i++) {
            tempGame.move(history[i]);
        }
        setGameState(tempGame);

        // Update Ply
        setCurrentPly(ply);

        // Update Board Visual
        postMessage({ type: 'GOTO_MOVE', index: ply - 1 });
    };


    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">

            {/* LEFT: Opening Library */}
            <OpeningLibrary
                savedGames={savedGames}
                onLoadOpening={(pgn) => {
                    loadPgn(pgn);
                    setMode('view');
                }}
                onImportPgn={() => {
                    const pgn = prompt("Pegue su PGN aquí:");
                    if (pgn) loadPgn(pgn);
                }}
            />

            {/* CENTER: Board & Controls */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">

                {/* Breadcrumbs & Header */}
                <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-white/5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                            <span>Inicio</span>
                            <span className="text-slate-700">/</span>
                            <span>Entrenamiento</span>
                            <span className="text-slate-700">/</span>
                            <span className="text-slate-300">Visor PGN y Juego Libre</span>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="text-slate-500 font-mono text-xs flex items-center gap-2 bg-slate-900 py-1 px-3 rounded-full border border-slate-800">
                        <span className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                        {isThinking ? 'Calculando...' : 'Motor Listo'}
                    </div>
                </div>

                {/* Tabs (Pill Style) */}
                <div className="px-6 py-4 flex justify-center">
                    <div className="bg-slate-900 p-1 rounded-xl flex text-sm font-bold border border-slate-800 shadow-xl">
                        <button
                            onClick={() => toggleMode('view')}
                            className={`px-8 py-2 rounded-lg transition-all ${mode === 'view' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Visor PGN
                        </button>
                        <button
                            onClick={() => toggleMode('play')}
                            className={`px-8 py-2 rounded-lg transition-all ${mode === 'play' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Jugar vs Stockfish
                        </button>
                    </div>
                </div>

                {/* Board Area - Wooden Style Container */}
                <div className="flex-1 flex items-center justify-center bg-slate-950 relative p-4 pl-8 pr-8 pb-8">
                    {/* Wood Texture Simulation using CSS Gradients */}
                    <div className="aspect-square h-full max-h-[75vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg p-3 relative"
                        style={{
                            background: 'linear-gradient(45deg, #3d2b1f 0%, #5c4033 100%)', // Dark wood base
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)'
                        }}>

                        {/* Inner Bevel */}
                        <div className="w-full h-full border-[2px] border-[#755038] rounded shadow-inner overflow-hidden relative bg-[#262421]">
                            <iframe
                                ref={iframeRef}
                                src="/analysis_board.html"
                                title="Chess Board"
                                className="w-full h-full"
                                style={{ border: 'none' }}
                            />
                        </div>

                        {/* Board Controls Overlay (Optional, if we wanted floating controls) */}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="h-20 border-t border-slate-800/50 bg-slate-900/30 px-8 flex items-center justify-between backdrop-blur-sm">
                    {/* Navigation */}
                    <div className="flex gap-1">
                        <button onClick={() => navTo(0)} disabled={currentPly === 0} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 transition-colors"><SkipBack className="w-5 h-5" /></button>
                        <button onClick={() => navTo(currentPly - 1)} disabled={currentPly === 0} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => navTo(currentPly + 1)} disabled={currentPly >= history.length} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                        <button onClick={() => navTo(history.length)} disabled={currentPly >= history.length} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 transition-colors"><SkipForward className="w-5 h-5" /></button>
                    </div>

                    <div className="h-8 w-px bg-slate-800 mx-4"></div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (bestMove) {
                                    setCoachComment(`💡 Sugerencia: Intenta jugar ${bestMove}. Es la mejor continuación.`);
                                    /* Optional: Draw arrow on board via postMessage if implemented */
                                } else {
                                    setCoachComment("Calculando sugerencia...");
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded-lg font-bold text-sm transition-colors border border-blue-600/20"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div> Sugerencia
                        </button>
                        <button
                            onClick={() => {
                                if (confirm("¿Estás seguro de que quieres rendirte?")) {
                                    setCoachComment("Has abandonado la partida.");
                                    // Logic to stop game or reset
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-lg font-bold text-sm transition-colors border border-slate-700 hover:border-red-900/30"
                        >
                            <AlertCircle className="w-4 h-4" /> Rendirse
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Analysis Panel */}
            <AnalysisPanel
                history={history}
                currentPly={currentPly}
                evaluation={evaluation}
                bestMove={bestMove}
                isAnalyzing={isThinking}
                comment={coachComment}
                onJumpToMove={navTo}
            />
        </div>
    );
};

export default PGNViewer;
