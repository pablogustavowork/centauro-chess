
import React from 'react';
import { UserProfile, GameData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Target, Upload, Play, Trophy, Eye, Clock, CheckCircle, ArrowRight, FlaskConical, Dumbbell, Brain } from 'lucide-react';
import { analyze_player_games } from '../services/cognitiveEngine';

import CPLTrendGraph from './CPLTrendGraph';

interface DashboardProps {
  profile: UserProfile;
  history: GameData[];
  onUploadClick: () => void;
  onTrainingClick: () => void;
  onVisorClick: () => void;
  onDirectPgnLoad: (pgn: string, mode: 'analysis' | 'viewer') => void;
  onReviewGame: (game: GameData) => void;
  onTrainGame: (game: GameData) => void;
  onDeepAnalysisStart: (username: string, options: { count: number, perfType: string }) => void;
  onSeeAllHistory: () => void;
  isBatchAnalyzing: boolean;
  batchProgress: { current: number; total: number };
}

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, history, onUploadClick, onTrainingClick, onVisorClick, onDirectPgnLoad, 
  onReviewGame, onTrainGame, onDeepAnalysisStart, onSeeAllHistory, isBatchAnalyzing, batchProgress 
}) => {
  const [lichessUser, setLichessUser] = React.useState('');
  const [fetchCount, setFetchCount] = React.useState(20);
  const [perfType, setPerfType] = React.useState('all');

  // ... (Data calculation same as before)
  const trendData = history.length > 0
    ? history.map((g, i) => ({ name: `J${i + 1}`, cpl: g.averageCpl }))
    : [
      { name: 'SEM 1', cpl: 35 }, { name: 'SEM 2', cpl: 28 }, { name: 'SEM 3', cpl: 22 },
      { name: 'SEM 4', cpl: 18 }, { name: 'SEM 5', cpl: 12 }, { name: 'HOY', cpl: 9.5 }
    ];

  const currentCpl = history.length > 0 ? history[history.length - 1].averageCpl : 18.5;
  const improvement = "-12%";

  // Technical Radar Calculation
  const cognitiveData = analyze_player_games(history);
  const radarData = cognitiveData ? [
    { subject: 'Táctica', A: cognitiveData.playerProfile.recurrentTechnical['táctica'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['táctica'] * 15) : 100 },
    { subject: 'Cálculo', A: cognitiveData.playerProfile.recurrentTechnical['cálculo'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['cálculo'] * 15) : 100 },
    { subject: 'Estrategia', A: cognitiveData.playerProfile.recurrentTechnical['estrategia'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['estrategia'] * 15) : 100 },
    { subject: 'Defensa', A: cognitiveData.playerProfile.recurrentTechnical['defensa'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['defensa'] * 15) : 100 },
    { subject: 'Apertura', A: cognitiveData.playerProfile.recurrentTechnical['apertura'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['apertura'] * 15) : 100 },
    { subject: 'Finales', A: cognitiveData.playerProfile.recurrentTechnical['finales'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['finales'] * 15) : 100 },
    { subject: 'Tiempo', A: cognitiveData.playerProfile.recurrentTechnical['manejo del tiempo'] ? Math.max(0, 100 - cognitiveData.playerProfile.recurrentTechnical['manejo del tiempo'] * 15) : 100 },
  ] : [
    { subject: 'Táctica', A: 80 }, { subject: 'Cálculo', A: 70 }, { subject: 'Estrategia', A: 60 },
    { subject: 'Defensa', A: 90 }, { subject: 'Apertura', A: 85 }, { subject: 'Finales', A: 65 }, { subject: 'Tiempo', A: 75 }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Panel de Control</h1>
          <p className="text-slate-400 text-lg">Bienvenido de nuevo, revisa tu progreso y continúa tu entrenamiento.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors">
          <span className="text-xl">🔔</span>
        </div>
      </div>

      {/* ... (Metrics row same as before) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CPLTrendGraph data={trendData} currentCpl={currentCpl} improvement={improvement} />
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden h-full">
           <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2 mt-2 w-full text-left pl-4">
              <Brain className="w-4 h-4 text-blue-400" /> Huella Técnica
           </h3>
           <div className="w-full h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                 <PolarGrid stroke="#1e293b" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                 <Radar name="Precisión" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* NEW: Lichess Deep Diagnosis Section */}
      <h2 className="flex items-center gap-2 text-xl font-bold text-white mt-8">
        <span className="text-orange-500">⚛️</span> Diagnóstico Profundo
      </h2>
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-64 bg-blue-500/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
               <h3 className="text-2xl font-bold text-white mb-3">Escáner de Rendimiento Lichess</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                  Importa tus últimas 20 partidas directamente de Lichess. Analizaremos tu ACPL, tus errores más frecuentes y generaremos un reporte de situación detallado para "El Gimnasio".
               </p>
               
               <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={perfType} 
                    onChange={(e) => setPerfType(e.target.value)}
                    disabled={isBatchAnalyzing}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Todos los ritmos</option>
                    <option value="blitz">Blitz</option>
                    <option value="rapid">Rápido</option>
                    <option value="classical">Clásico</option>
                  </select>

                  <select 
                    value={fetchCount} 
                    onChange={(e) => setFetchCount(Number(e.target.value))}
                    disabled={isBatchAnalyzing}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={5}>Últimas 5</option>
                    <option value={10}>Últimas 10</option>
                    <option value={20}>Últimas 20</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Tu usuario de Lichess" 
                    value={lichessUser}
                    onChange={(e) => setLichessUser(e.target.value)}
                    disabled={isBatchAnalyzing}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors min-w-[200px]"
                  />
                  <button 
                    onClick={() => onDeepAnalysisStart(lichessUser, { count: fetchCount, perfType })}
                    disabled={isBatchAnalyzing || !lichessUser}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {isBatchAnalyzing ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Analizando {batchProgress.current}/{batchProgress.total}...
                      </>
                    ) : (
                      <>
                        Iniciar Diagnóstico <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
               </div>
            </div>
            
            <div className="hidden lg:flex gap-4">
               {/* Stats preview placeholders */}
               <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-center w-32">
                  <div className="text-blue-400 font-bold text-lg">20</div>
                  <div className="text-[10px] text-slate-500 uppercase">Partidas</div>
               </div>
               <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-center w-32">
                  <div className="text-green-400 font-bold text-lg">Deep</div>
                  <div className="text-[10px] text-slate-500 uppercase">Análisis</div>
               </div>
            </div>
         </div>

         {isBatchAnalyzing && (
           <div className="mt-8">
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                ></div>
              </div>
           </div>
         )}
      </div>

      {/* Quick Access (Action Cards) */}
      <h2 className="flex items-center gap-2 text-xl font-bold text-white mt-8">
        <span className="text-blue-500">⚡</span> Herramientas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Lab */}
        <div className="group relative bg-slate-900 rounded-3xl p-8 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer" onClick={onUploadClick}>
          {/* Bg Effect */}
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
          <div className="absolute -bottom-10 -right-10 text-slate-800/20 group-hover:text-blue-500/10 transition-colors">
            <FlaskConical className="w-48 h-48" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 border border-slate-700 shadow-lg">
                <FlaskConical className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">El Laboratorio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Analiza tus partidas en profundidad y descubre patrones de error con Stockfish 16.</p>
            </div>
            <button className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
              Ir al Laboratorio <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gym */}
        <div className="group relative bg-slate-900 rounded-3xl p-8 border border-slate-800 overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer" onClick={onTrainingClick}>
          <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-orange-600/10 transition-colors"></div>
          <div className="absolute -bottom-10 -right-10 text-slate-800/20 group-hover:text-orange-500/10 transition-colors">
            <Dumbbell className="w-48 h-48" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 border border-slate-700 shadow-lg">
                <Dumbbell className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">El Gimnasio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Entrenamiento táctico personalizado basado en tus errores recientes.</p>
            </div>
            <button className="mt-8 w-full py-3 bg-slate-800 hover:bg-orange-600 text-white border border-slate-700 hover:border-orange-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              Entrenar Ahora <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Visor */}
        <div className="group relative bg-slate-900 rounded-3xl p-8 border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer" onClick={onVisorClick}>
          <div className="absolute inset-0 bg-purple-600/5 group-hover:bg-purple-600/10 transition-colors"></div>
          <div className="absolute -bottom-10 -right-10 text-slate-800/20 group-hover:text-purple-500/10 transition-colors">
            <Eye className="w-48 h-48" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 border border-slate-700 shadow-lg">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Visor PGN</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Importa, organiza y revisa tus bases de datos de partidas libremente.</p>
            </div>
            <button className="mt-8 w-full py-3 bg-slate-800 hover:bg-purple-600 text-white border border-slate-700 hover:border-purple-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              Abrir Visor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>


      <div className="mt-8">
        <h2 className="flex items-center justify-between text-xl font-bold text-white mt-8 mb-6">
          <span>Actividad Reciente</span>
          <button onClick={onSeeAllHistory} className="text-sm text-blue-500 hover:text-blue-400 font-medium cursor-pointer">Ver todo</button>
        </h2>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay actividad reciente. Juega una partida para empezar.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.slice(0, 20).map((game) => (
                <div key={game.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${game.averageCpl < 30 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {game.averageCpl < 30 ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Análisis: {game.white} vs {game.black}</h4>
                      <p className="text-xs text-slate-500">{game.averageCpl} ACPL • {game.result}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-600">{game.date}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onReviewGame(game)} className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs font-bold transition-colors">Ver</button>
                      <button onClick={() => onTrainGame(game)} className="px-3 py-1 bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white rounded text-xs font-bold transition-colors">Entrenar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
