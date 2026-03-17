
import React from 'react';
import { BatchAnalysisResult, GameData, ErrorType } from '../types';
import { 
    TrendingUp, 
    ArrowLeft, 
    Target, 
    AlertTriangle, 
    Activity, 
    CheckCircle, 
    ChevronRight,
    Dumbbell,
    ExternalLink
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid 
} from 'recharts';

interface DeepAnalysisReportProps {
    result: BatchAnalysisResult;
    onBack: () => void;
    onReviewGame: (game: GameData) => void;
}

const DeepAnalysisReport: React.FC<DeepAnalysisReportProps> = ({ result, onBack, onReviewGame }) => {
    const errorStats = [
        { type: ErrorType.TACTICAL_GRAVE, count: result.errorDistribution[ErrorType.TACTICAL_GRAVE], color: 'text-red-500', bg: 'bg-red-500/10' },
        { type: ErrorType.POSITIONAL_STRONG, count: result.errorDistribution[ErrorType.POSITIONAL_STRONG], color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { type: ErrorType.OPENING_IMPRECISION, count: result.errorDistribution[ErrorType.OPENING_IMPRECISION], color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { type: ErrorType.MINOR, count: result.errorDistribution[ErrorType.MINOR], color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    const chartData = result.accuracyTrend.map((acc, i) => ({
        name: `P${i + 1}`,
        accuracy: acc
    }));

    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar">
            
            {/* Navigation & Title */}
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Volver al Dashboard
                </button>
                <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Diagnóstico Completado</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Reporte de Situación Personal</h1>
                    <p className="text-slate-400 text-lg">Analizando las últimas {result.gamesCount} partidas de <span className="text-blue-400 font-bold">@{result.username}</span></p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Precisión Media</div>
                        <div className="text-4xl font-black text-white">{Math.round(result.accuracyTrend.reduce((a, b) => a + b, 0) / result.gamesCount)}%</div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Accuracy Trend Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 rounded-3xl p-8 border border-slate-800 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Tendencia de Rendimiento
                            </h3>
                            <p className="text-xs text-slate-500">Variación de precisión en las últimas {result.gamesCount} partidas</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="accuracy" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorAcc)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error Distribution & Cognitive Causes */}
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col space-y-8">
                    
                    {/* Technical Errors */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Errores Técnicos
                        </h3>
                        <div className="space-y-4">
                            {errorStats.map((stat) => (
                                <div key={stat.type}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-300">{stat.type}</span>
                                        <span className={`text-sm font-bold ${stat.color}`}>{stat.count}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${stat.bg.replace('/10', '')} transition-all duration-1000`} 
                                            style={{ width: `${(stat.count / Math.max(...errorStats.map(s => s.count), 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cognitive Causes (New Engine) */}
                    {result.cognitiveAnalysis && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-purple-500" />
                                Causas Cognitivas
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(result.cognitiveAnalysis.playerProfile.recurrentCauses)
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .slice(0, 4)
                                    .map(([cause, count]) => (
                                    <div key={cause}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate max-w-[200px]">{cause}</span>
                                            <span className="text-xs font-bold text-purple-400">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500 transition-all duration-1000" 
                                                style={{ width: `${((count as number) / Math.max(...Object.values(result.cognitiveAnalysis!.playerProfile.recurrentCauses) as number[], 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Generative Coach Recommendation */}
                    <div className="mt-auto p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            Prioridad de Entrenamiento
                        </h4>
                        <p className="text-sm text-blue-300/80 leading-relaxed italic">
                            "{result.cognitiveAnalysis?.trainingPriorities[0]?.description || `Enfócate en mejorar el aspecto de ${result.dominantError}`}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Games List */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-6">Partidas Analizadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.games.map((game, idx) => (
                        <div 
                            key={game.id} 
                            onClick={() => onReviewGame(game)}
                            className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group hover:bg-slate-800/50"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono uppercase">#{idx + 1}</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{game.white === result.username ? `vs ${game.black}` : `vs ${game.white}`}</span>
                                </div>
                                <div className={`text-xs px-2 py-0.5 rounded font-bold ${game.averageCpl < 30 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {game.averageCpl} ACPL
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] text-slate-600 italic truncate">{game.date.split('T')[0]}</span>
                                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Footer */}
            <div className="mt-12 flex flex-col items-center">
                <button 
                  onClick={onBack}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl text-lg flex items-center gap-3 shadow-2xl shadow-blue-900/40 hover:scale-[1.02] transition-all"
                >
                    <Dumbbell className="w-6 h-6" />
                    Ir al Gimnasio con este Perfil
                </button>
                <p className="text-slate-500 text-sm mt-4">Toda la información ha sido sincronizada con tu cuenta de UrosLabs.</p>
            </div>
            
            <div className="h-20"></div> {/* Bottom spacer */}
        </div>
    );
};

export default DeepAnalysisReport;
