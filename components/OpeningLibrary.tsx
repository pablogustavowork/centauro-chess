
import React, { useState } from 'react';
import { Search, Book, Folder, ChevronDown, ChevronRight, FileText, Upload } from 'lucide-react';

interface Opening {
    name: string;
    pgn: string;
    eco: string;
    category: string;
}

interface OpeningLibraryProps {
    savedGames?: any[];
    onLoadOpening: (pgn: string) => void;
    onImportPgn: () => void;
}

const OPENINGS_DB: Opening[] = [
    { category: "Juegos Abiertos (1.e4)", name: "Apertura Española (Ruy Lopez)", eco: "C60", pgn: '[Event "Ruy Lopez"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 *' },
    { category: "Juegos Abiertos (1.e4)", name: "Defensa Petrov", eco: "C42", pgn: '[Event "Petrov"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 e5 2. Nf3 Nf6 *' },
    { category: "Juegos Abiertos (1.e4)", name: "Gambito de Rey", eco: "C30", pgn: '[Event "Kings Gambit"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 e5 2. f4 *' },
    { category: "Juegos Abiertos (1.e4)", name: "Apertura Italiana", eco: "C50", pgn: '[Event "Italian Game"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 *' },

    { category: "Juegos Semi-Abiertos", name: "Defensa Siciliana", eco: "B20", pgn: '[Event "Sicilian"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 c5 *' },
    { category: "Juegos Semi-Abiertos", name: "Defensa Francesa", eco: "C00", pgn: '[Event "French"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 e6 *' },
    { category: "Juegos Semi-Abiertos", name: "Defensa Caro-Kann", eco: "B10", pgn: '[Event "Caro-Kann"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. e4 c6 *' },

    { category: "Juegos Cerrados (1.d4)", name: "Gambito de Dama", eco: "D06", pgn: '[Event "Queens Gambit"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. d4 d5 2. c4 *' },
    { category: "Juegos Cerrados (1.d4)", name: "Sistema Londres", eco: "D02", pgn: '[Event "London"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. d4 d5 2. Bf4 *' },

    { category: "Defensas Indias", name: "Defensa India de Rey", eco: "E60", pgn: '[Event "KID"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 *' },
];

const OpeningLibrary: React.FC<OpeningLibraryProps> = ({ onLoadOpening, onImportPgn, savedGames }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "Mis Partidas Guardadas": true,
        "Juegos Abiertos (1.e4)": false
    });

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Dynamic DB assembly
    const allOpenings = React.useMemo(() => {
        let list = [...OPENINGS_DB];
        if (savedGames && savedGames.length > 0) {
            const userOpe = savedGames.map(g => ({
                name: `${g.white} vs ${g.black}`,
                pgn: g.pgn,
                eco: g.result || g.date,
                category: "Mis Partidas Guardadas"
            }));
            list = [...userOpe, ...list];
        }
        return list;
    }, [savedGames]);

    // Filter logic
    const filteredOpenings = allOpenings.filter(op =>
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.eco.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by category
    const grouped = filteredOpenings.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr);
        return acc;
    }, {} as Record<string, Opening[]>);

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-80 flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-white font-bold mb-1">Biblioteca de Aperturas</h2>
                <p className="text-xs text-slate-500">Carga rápida para estudio</p>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar (ej. Siciliana)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                {(Object.entries(grouped) as [string, Opening[]][]).map(([category, openings]) => (
                    <div key={category} className="mb-3">
                        <button
                            onClick={() => toggleCategory(category)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${expandedCategories[category] ? 'bg-slate-800 border-slate-700' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${category === 'Mis Partidas Guardadas' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : category.includes('Abiertos') ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : category.includes('Semi') ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : category.includes('Cerrados') ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`}></div>
                                <span className="text-sm font-bold text-slate-200">{category}</span>
                            </div>
                            {expandedCategories[category] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </button>

                        {expandedCategories[category] && (
                            <div className="mt-1 ml-1 pl-3 border-l-2 border-slate-800 space-y-1 py-1">
                                {openings.map(op => (
                                    <button
                                        key={op.name}
                                        onClick={() => onLoadOpening(op.pgn)}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex justify-between items-center group"
                                    >
                                        <span className="truncate pr-2">{op.name}</span>
                                        <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 group-hover:border-slate-700 transition-colors">{op.eco}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Import */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onImportPgn}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-colors font-medium text-sm border border-slate-700 hover:border-slate-600"
                >
                    <Upload className="w-4 h-4" /> Importar PGN
                </button>
            </div>
        </div>
    );
};

export default OpeningLibrary;
