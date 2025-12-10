
import React, { useState, useEffect, useRef } from 'react';
import { CriticalMoment } from '../types';
import { Timer, Brain, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';

interface CriticalChallengeProps {
    moment: CriticalMoment;
    onComplete: (success: boolean) => void;
    onExit: () => void;
}

const CriticalChallenge: React.FC<CriticalChallengeProps> = ({ moment, onComplete, onExit }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [status, setStatus] = useState<'playing' | 'success' | 'failed' | 'timeout' | 'surrender'>('playing');
    const [userMove, setUserMove] = useState<string | null>(null);

    // Initialize Iframe
    useEffect(() => {
        const initIframe = () => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                // Load Start Position
                iframeRef.current.contentWindow.postMessage({
                    type: 'LOAD_FEN',
                    fen: moment.fen
                }, '*');

                // Enable Interaction
                iframeRef.current.contentWindow.postMessage({
                    type: 'ENABLE_INTERACTION',
                    enabled: status === 'playing',
                    side: moment.isWhite ? 'w' : 'b'
                }, '*');
            }
        };

        // Wait for load
        const timer = setTimeout(initIframe, 500);
        return () => clearTimeout(timer);
    }, [moment.fen, status]); // Re-run if status changes (e.g. disable on success)

    // Listen for Moves
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'MOVE_ATTEMPT') {
                handleMoveAttempt(event.data.san);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [moment.bestMove, status]);

    useEffect(() => {
        if (status !== 'playing') return;
        const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
        if (timeLeft === 0) setStatus('timeout');
        return () => clearInterval(timer);
    }, [timeLeft, status]);

    const handleMoveAttempt = (san: string) => {
        if (status !== 'playing') return;

        setUserMove(san);

        // Simple string comparison for best move
        // Note: SAN must specific. "Nf3" vs "Nf3+". 
        // analysis_board.html uses Chess.js 0.10.3 SAN generation.
        // Stockfish (analysisService) uses Chess.js 1.4.0 SAN generation.
        // They should be compatible for simple moves, but checks/mates might differ slightly (+ or #).
        // Let's normalize by removing special chars for comparison if standard fails.
        const normalize = (s: string) => s.replace(/[+#]/g, '');

        if (normalize(san) === normalize(moment.bestMove)) {
            setStatus('success');
            onComplete(true);
        } else {
            setStatus('failed');
            onComplete(false);
        }
    };

    const handleSurrender = () => {
        setStatus('surrender');
        // Show solution in iframe?
        // We can load FEN + move? Or just let user see the text.
        // Let's just user text confirmation for now, complexity of showing arrow in iframe is high.
    };

    const handleRetry = () => {
        setStatus('playing');
        setTimeLeft(180);
        setUserMove(null);
        // Iframe effect will re-trigger to reset board due to status dependency
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Challenge Controls */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Brain className="w-8 h-8 text-green-500" />
                            El Gimnasio
                        </h2>
                        <p className="text-slate-400">
                            Estás de vuelta en la jugada {moment.moveNumber}.
                            <br />
                            {status === 'playing' ? (
                                <span className="text-yellow-500 flex items-center gap-2 mt-1 font-medium">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                    Stockfish desactivado (Entrenamiento)
                                </span>
                            ) : (
                                <span className="text-green-400 flex items-center gap-2 mt-1 font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Análisis desbloqueado
                                </span>
                            )}
                        </p>
                    </div>

                    <div className={`p-6 rounded-2xl border-2 flex items-center justify-center gap-4 transition-all ${timeLeft < 30 && status === 'playing' ? 'bg-red-900/20 border-red-500 animate-pulse' : 'bg-slate-800 border-slate-700'
                        }`}>
                        <Timer className={`w-8 h-8 ${timeLeft < 30 ? 'text-red-500' : 'text-slate-200'}`} />
                        <span className={`text-4xl font-mono font-bold ${timeLeft < 30 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* In-Game Actions */}
                    {status === 'playing' && (
                        <button
                            onClick={handleSurrender}
                            className="w-full py-4 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500 text-slate-300 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Eye className="w-5 h-5 text-slate-500 group-hover:text-white" />
                            Me rindo, activar Motor
                        </button>
                    )}

                    {status !== 'playing' && (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-bold text-white mb-2">Análisis de Stockfish</h3>

                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                    <div className="text-slate-500 mb-1">En Partida</div>
                                    <div className="font-bold text-red-400 text-lg">{moment.movePlayed}</div>
                                </div>
                                <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                    <div className="text-slate-500 mb-1">Tu intento</div>
                                    <div className={`font-bold text-lg ${status === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {userMove || 'N/A'}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-900 rounded border border-green-900/50 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                                    <div className="relative z-10">
                                        <div className="text-green-400 mb-1">Óptimo</div>
                                        <div className="font-bold text-white text-lg">{moment.bestMove}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button onClick={onExit} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white">
                                    Volver al Laboratorio
                                </button>
                                {status !== 'success' && (
                                    <button onClick={handleRetry} className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white flex items-center justify-center gap-2">
                                        <RotateCcw className="w-4 h-4" /> Reintentar
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Board */}
                <div className="relative">
                    <div className="aspect-square w-full max-w-[500px] mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700 bg-slate-900">
                        <iframe
                            ref={iframeRef}
                            src="/analysis_board.html"
                            className="w-full h-full border-0"
                            title="Tablero Táctico"
                        />
                    </div>

                    {/* Status Overlay */}
                    {status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none z-20">
                            <CheckCircle className="w-32 h-32 text-green-400 drop-shadow-lg" />
                        </div>
                    )}
                    {status === 'failed' && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none z-20">
                            <XCircle className="w-32 h-32 text-red-400 drop-shadow-lg" />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CriticalChallenge;
