import React, { useState, useEffect, useRef } from 'react';
import { GameData } from '../types';
import { Share2, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SkipBack, SkipForward } from 'lucide-react';
import EvaluationGraph from './EvaluationGraph';
import { getGameCoachComment } from '../services/geminiService';
import { Chess } from 'chess.js';
import AnalysisPanel from './AnalysisPanel';

interface GameReviewViewProps {
    game: GameData;
    onAnalyzeCriticalMoments: () => void;
    onBackToDashboard: () => void;
}

const GameReviewView: React.FC<GameReviewViewProps> = ({ game, onAnalyzeCriticalMoments, onBackToDashboard }) => {
    // Phase 2 Data
    const evals = game.evalHistory || [];

    const [currentPly, setCurrentPly] = useState(0);
    const [history, setHistory] = useState<string[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [fenMap, setFenMap] = useState<Record<number, string>>({});

    // Parse PGN to get History and FENs
    useEffect(() => {
        try {
            const c = new Chess();
            // Handle PGN robustly
            const cleanPgn = game.pgn.replace(/\{.*?\}/gs, '').replace(/\(.*\)/gs, '');
            c.loadPgn(cleanPgn);
            setHistory(c.history());
        } catch (e) {
            console.error("Error parsing PGN for review", e);
            setHistory([]);
        }
    }, [game.pgn]);

    // Sync Board with Current Ply
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            // Send GOTO_MOVE command to iframe (Laboratory Logic)
            iframeRef.current.contentWindow.postMessage({
                type: 'GOTO_MOVE',
                index: currentPly - 1 // Logic uses 0-based index for actual moves
            }, '*');
        }
    }, [currentPly]);

    // Load Game into Iframe INITIALLY
    useEffect(() => {
        const timer = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const cleanPgn = game.pgn.replace(/\{.*?\}/gs, '').replace(/\(.*\)/gs, '');
                iframeRef.current.contentWindow.postMessage({
                    type: 'LOAD_PGN',
                    pgn: cleanPgn
                }, '*');
                // Force go to start after load
                setTimeout(() => {
                    if (iframeRef.current?.contentWindow)
                        iframeRef.current?.contentWindow.postMessage({ type: 'GOTO_MOVE', index: -1 }, '*');
                }, 200);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [game.pgn]);


    const goToPly = (ply: number) => {
        if (ply < 0) ply = 0;
        if (ply > history.length) ply = history.length;
        setCurrentPly(ply);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') goToPly(currentPly + 1);
        if (e.key === 'ArrowLeft') goToPly(currentPly - 1);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPly, history.length]);

    // Derived Data for AnalysisPanel
    const currentEval = evals.find(e => e.ply === currentPly);
    const evaluation = currentEval ? { cp: currentEval.score } : null;

    // Check if this ply was a critical moment to show best move
    const criticalMoment = game.criticalMoments?.find(m => m.ply === currentPly);
    const bestMove = criticalMoment ? criticalMoment.bestMove : undefined;

    // Generate comment
    const comment = criticalMoment
        ? `Aquí hubo una ${criticalMoment.description}. Mejor opción: ${criticalMoment.bestMove}.`
        : "Movimiento del libro o jugada sólida.";

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={onBackToDashboard} className="text-slate-400 hover:text-white text-sm">← Volver</button>
                    <h1 className="text-xl font-bold text-white">Revisión de Partida</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><Share2 className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><Download className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Interactive Board */}
                <div className="flex-1 bg-black/20 flex flex-col items-center justify-start p-8 gap-6 overflow-y-auto">

                    {/* Board Area */}
                    <div className="w-full max-w-[600px] aspect-square relative p-3 rounded-lg shadow-2xl animate-in fade-in"
                        style={{
                            background: 'linear-gradient(45deg, #3d2b1f 0%, #5c4033 100%)', // Dark wood base
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)'
                        }}>

                        {/* Inner Bevel */}
                        <div className="w-full h-full border-[2px] border-[#755038] rounded shadow-inner overflow-hidden relative bg-[#262421]">
                            <iframe
                                ref={iframeRef}
                                src="/analysis_board.html"
                                className="w-full h-full border-0"
                                title="Tablero de Revisión"
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-full border border-slate-700 shadow-xl">
                        <button onClick={() => goToPly(0)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
                        <button onClick={() => goToPly(currentPly - 1)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                        <span className="font-mono font-bold text-white min-w-[3rem] text-center">{Math.ceil(currentPly / 2) || "Inicio"}</span>
                        <button onClick={() => goToPly(currentPly + 1)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-6 h-6" /></button>
                        <button onClick={() => goToPly(history.length)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
                    </div>

                </div>

                {/* Right: Analysis Panel (Reused) */}
                <AnalysisPanel
                    history={history}
                    currentPly={currentPly}
                    evaluation={evaluation}
                    bestMove={bestMove}
                    isAnalyzing={false}
                    comment={comment}
                    onJumpToMove={goToPly}
                />
            </div>
        </div>
    );
};

export default GameReviewView;
