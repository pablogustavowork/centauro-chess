import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PGNViewerProps {
    onBack: () => void;
}




interface Opening {
    name: string;
    pgn: string;
    eco: string;
}

const CLASSIC_OPENINGS: Opening[] = [
    {
        name: "Apertura Española (Ruy López)",
        eco: "C60",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 *'
    },
    {
        name: "Defensa Siciliana",
        eco: "B20",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 c5 *'
    },
    {
        name: "Gambito de Dama",
        eco: "D06",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. d4 d5 2. c4 *'
    },
    {
        name: "Defensa Francesa",
        eco: "C00",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 e6 *'
    },
    {
        name: "Apertura Italiana",
        eco: "C50",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 *'
    },
    {
        name: "Defensa Caro-Kann",
        eco: "B10",
        pgn: '[Event "Classic Opening"]\n[Site "CentaUros"]\n[Date "2024.01.01"]\n[Round "1"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 c6 *'
    }
];

const PGNViewer: React.FC<PGNViewerProps> = ({ onBack, initialPgn }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);


    const loadOpening = (pgn: string) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'LOAD_PGN', pgn }, '*');
        }
    };

    // Load initial PGN if provided
    React.useEffect(() => {
        if (initialPgn && iframeRef.current) {
            // Small delay to ensure iframe is ready
            const timer = setTimeout(() => {
                loadOpening(initialPgn);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialPgn]);

    return (
        <div className="w-full max-w-[95%] mx-auto p-4 md:p-6 min-h-screen flex flex-col gap-6 animate-in fade-in">
            {/* Header */}
            <header className="flex items-center justify-between bg-slate-900/50 backdrop-blur p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Volver</span>
                    </button>
                    <div className="h-8 w-px bg-slate-700 mx-2"></div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">♟️</span>
                        <span className="hidden sm:inline">Visor de Partidas</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono tracking-wider">LEGACY ENGINE</span>
                    </h1>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 h-[85vh]">
                {/* Sidebar - Classic Openings */}
                <div className="w-full lg:w-80 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <span className="text-green-500">📖</span> Aperturas Clásicas
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {CLASSIC_OPENINGS.map((opening) => (
                            <button
                                key={opening.eco}
                                onClick={() => loadOpening(opening.pgn)}
                                className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-700"
                            >
                                <div className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">
                                    {opening.name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1 flex justify-between">
                                    <span>{opening.eco}</span>
                                    <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">Cargar →</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-3 bg-slate-950/30 text-xs text-slate-500 text-center border-t border-slate-800">
                        Selecciona para cargar
                    </div>
                </div>

                {/* Main Viewer */}
                <div className="flex-1 relative bg-slate-900 rounded-xl shadow-2xl border border-slate-700 h-full">
                    <iframe
                        ref={iframeRef}
                        src="/visor.html"
                        title="Visor PGN"
                        className="w-full h-full border-none"
                        style={{ background: 'transparent' }}
                    />
                </div>
            </div>

            <div className="text-center text-slate-500 text-xs font-mono">
                CentaUros Chess Platform - Legacy Support Module
            </div>
        </div>
    );
};

export default PGNViewer;
