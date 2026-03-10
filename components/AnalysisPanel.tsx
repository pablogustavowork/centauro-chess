
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Copy, Download, Bot, ChevronRight } from 'lucide-react';

interface AnalysisPanelProps {
    history: string[]; // SAN moves
    currentPly: number; // 0-indexed ply (actual half-move count)
    evaluation: { cp?: number; mate?: number } | null;
    bestMove?: string;
    isAnalyzing: boolean;
    comment?: string;
    onJumpToMove: (ply: number) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ history = [], currentPly, evaluation, bestMove, isAnalyzing, comment, onJumpToMove }) => {
    const scrollRef = useRef<HTMLTableRowElement>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Auto-scroll to bottom only when history length changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [history.length]);

    // Helper to identify piece from SAN
    const formatPieceName = (san: string) => {
        if (!san) return 'pieza';
        const cleanSan = san.replace(/[+#x=]/g, ''); // Remove check, mate, capture, promo
        const firstChar = cleanSan.charAt(0);

        if (firstChar === 'N') return 'tu Caballo';
        if (firstChar === 'B') return 'tu Alfil';
        if (firstChar === 'R') return 'tu Torre';
        if (firstChar === 'Q') return 'tu Dama';
        if (firstChar === 'K') return 'tu Rey';
        if (cleanSan === 'O-O' || cleanSan === 'O-O-O') return 'tu Enroque';
        // Default (Pawn moves don't start with uppercase usually, unless capture like exd5)
        // If it starts with lowercase, it's a pawn.
        if (firstChar === firstChar.toLowerCase()) return 'tu Peón';

        return 'tu Pieza';
    };

    // TTS Effect for Best Move
    useEffect(() => {
        if (!bestMove || isMuted) return;

        // Cancel previous speech to avoid overlap
        window.speechSynthesis.cancel();

        const pieceName = formatPieceName(bestMove);
        const text = `Mejor jugada: ${bestMove}. La respuesta más sólida aquí sería mover ${pieceName}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;

        // Find a decent voice if possible (optional optimization)
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(v => v.lang.includes('es')) || null;

        window.speechSynthesis.speak(utterance);

    }, [bestMove, isMuted]); // Trigger only when bestMove changes or mute state changes

    // Helper to format eval
    const formatEval = () => {
        if (!evaluation) return '+0.00';
        if (evaluation.mate !== undefined && evaluation.mate !== null) return `M${evaluation.mate}`;
        const cp = evaluation.cp ?? 0;
        return (cp / 100).toFixed(2);
    };

    // Calculate bar width (simple sigmoid visualization)
    const getBarPercent = () => {
        if (!evaluation) return 50;
        let score = (evaluation.cp ?? 0) / 100;
        if (evaluation.mate) score = evaluation.mate > 0 ? 10 : -10;

        // Sigmoid to keep it bounded 0-100
        // Score 0 -> 50%
        // Score +5 -> ~90%
        // Score -5 -> ~10%
        const sigmoid = 1 / (1 + Math.exp(-0.5 * score));
        return sigmoid * 100;
    };

    // Group history into pairs (White, Black)
    const historyPairs = [];
    if (Array.isArray(history)) {
        for (let i = 0; i < history.length; i += 2) {
            historyPairs.push({
                num: Math.floor(i / 2) + 1,
                white: history[i],
                black: history[i + 1] || '',
                plyWhite: i + 1,
                plyBlack: i + 2
            });
        }
    }

    const currentMoveSan = (currentPly > 0 && history[currentPly - 1]) ? history[currentPly - 1] : "Inicio";

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 flex-shrink-0">
            {/* Coach Header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-slate-700 shadow-lg">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Instructor CentaUros</h3>
                            <p className="text-xs text-blue-400 font-mono">Stockfish 16 • Profundidad 22</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`transition-colors ${isMuted ? 'text-slate-600 hover:text-slate-400' : 'text-blue-400 hover:text-white'}`}
                        title={isMuted ? "Activar Voz" : "Silenciar Voz"}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Evaluation Bar */}
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold">
                    <span className="text-white">{formatEval()}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-white transition-all duration-500 ease-out"
                            style={{ width: `${getBarPercent()}%` }}
                        ></div>
                    </div>
                    <span className="text-slate-500">{typeof formatEval() === 'string' && !formatEval().startsWith('M') ? -Number(formatEval()) : ''}</span>
                </div>
            </div>

            {/* Live Analysis Box */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Análisis en Tiempo Real</div>

                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg relative overflow-hidden group">
                    {/* Gloss Effect */}
                    <div className="absolute top-0 right-0 p-12 bg-white/5 blur-3xl rounded-full -mr-6 -mt-6 pointer-events-none"></div>

                    <div className="text-slate-300 text-sm mb-1 relative z-10">
                        Has jugado <span className="text-white font-black">{currentMoveSan}</span>.
                    </div>
                    <div className="text-slate-400 text-sm leading-relaxed relative z-10">
                        {comment || "Analizando posición..."}
                    </div>
                </div>

                {bestMove && (
                    <div className="bg-blue-900/10 border border-blue-600/30 rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <div className="text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> Mejor Jugada:
                        </div>
                        <div className="text-white font-bold text-lg flex items-center gap-2">
                            {bestMove}
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-normal">Óptima</span>
                        </div>
                        <div className="text-slate-400 text-xs mt-2 leading-relaxed">
                            La respuesta más sólida aquí sería mover <span className="text-blue-400 font-bold">{formatPieceName(bestMove)}</span> ({bestMove}).
                        </div>
                    </div>
                )}
            </div>

            {/* History Table */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
                <div className="p-2 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center text-xs text-slate-500 uppercase font-semibold">
                    <span>Historial de Movimientos</span>
                    <div className="flex gap-2">
                        <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                        <Download className="w-3 h-3 cursor-pointer hover:text-white" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-center">
                        <thead className="text-xs text-slate-500 bg-slate-900/50 sticky top-0 z-10">
                            <tr>
                                <th className="py-2 w-10">#</th>
                                <th className="py-2">Blancas</th>
                                <th className="py-2">Negras</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {historyPairs.map((row) => (
                                <tr key={row.num} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="py-1 text-slate-600 font-mono text-xs">{row.num}</td>
                                    <td className="py-1 p-0">
                                        <button
                                            onClick={() => onJumpToMove(row.plyWhite)}
                                            className={`w-full h-full py-1 text-slate-300 hover:text-white hover:bg-slate-700 ${currentPly === row.plyWhite ? 'bg-blue-600 text-white font-bold' : ''}`}
                                        >
                                            {row.white}
                                        </button>
                                    </td>
                                    <td className="py-1 p-0">
                                        {row.black && (
                                            <button
                                                onClick={() => onJumpToMove(row.plyBlack)}
                                                className={`w-full h-full py-1 text-slate-300 hover:text-white hover:bg-slate-700 ${currentPly === row.plyBlack ? 'bg-blue-600 text-white font-bold' : ''}`}
                                            >
                                                {row.black}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr ref={scrollRef}></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPanel;
