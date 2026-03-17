import React, { useMemo } from 'react';
import { UserProfile, GameData } from '../types';
import { analyze_player_games } from '../services/cognitiveEngine';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Settings, Share2, Brain, Target, AlertTriangle, Lightbulb, Activity, Zap } from 'lucide-react';

interface PlayerProfileProps {
  profile: UserProfile;
  history?: GameData[];
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ profile, history = [] }) => {
  // Generate cognitive profile dynamically based on history
  const cognitiveData = useMemo(() => {
    if (!history || history.length === 0) return null;
    return analyze_player_games(history);
  }, [history]);

  // If no data, show placeholder or empty state
  if (!cognitiveData) {
    return (
      <div className="min-h-screen bg-[#0f1420] text-slate-200 p-8 flex flex-col items-center justify-center animate-in fade-in">
        <Brain className="w-16 h-16 text-slate-700 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Perfil en Construcción</h2>
        <p className="text-slate-400 max-w-md text-center">
          Juega o importa partidas para que CentaUrosChess construya tu modelo cognitivo y descubra cómo piensas realmente frente al tablero.
        </p>
      </div>
    );
  }

  const { playerProfile, recurrentErrors, trainingPriorities } = cognitiveData;

  // Format Technical Data for Radar Chart
  const technicalKeys = ['táctica', 'estrategia', 'apertura', 'finales'];
  const radarData = technicalKeys.map(key => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    A: 100 - (playerProfile.recurrentTechnical[key] || 0) * 15, // Simple heuristic: start 100, subtract for each error
    fullMark: 100,
  })).map(data => ({ ...data, A: Math.max(0, data.A) })); // Cap at 0

  // Format Cognitive Causes for Bar Chart
  const causesData = Object.entries(playerProfile.recurrentCauses)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([cause, count]) => ({
      name: cause.split(' ')[0],
      fullName: cause,
      frecuencia: count as number
    }));

  const weakestPhaseMap: Record<string, string> = {
    apertura: 'Aperturas',
    medio_juego: 'Medio Juego',
    final: 'Finales'
  };

  const weakness = weakestPhaseMap[playerProfile.weakestPhase] || 'Medio Juego';
  const overallScore = Math.max(30, 100 - playerProfile.averageSeverity * 15);

  return (
    <div className="min-h-screen bg-[#0f1420] text-slate-200 font-sans p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar pb-24 h-full">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header & Settings */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
               <span className="font-serif text-xl font-bold text-white">♟</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CentaUros Profile</span>
          </div>
          <div className="flex gap-3">
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Identity & Main Dashboard */}
        <div className="bg-[#161b28] border border-white/5 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-40 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
           
           {/* Player Info */}
           <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full lg:w-auto">
             <div className="relative">
               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
                 <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-[#161b28] overflow-hidden">
                   <span className="text-4xl font-black text-white">{profile.name.charAt(0).toUpperCase()}</span>
                 </div>
               </div>
               <div className="absolute bottom-1 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#161b28]"></div>
             </div>
             
             <div className="text-center md:text-left">
               <h1 className="text-4xl font-black text-white mb-2">{profile.name}</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                 <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold rounded-full border border-purple-500/30">CentaUro Nivel {history.length}</span>
                 <span className="text-slate-400 font-mono tracking-widest uppercase">Rank Global #422</span>
               </div>
             </div>
           </div>

           {/* Conceptual Metrics */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-12 text-center lg:text-left z-10 w-full lg:w-auto mt-6 lg:mt-0">
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 flex items-center justify-center lg:justify-start gap-1">
                 <Activity className="w-3 h-3 text-red-400" /> Índice de Riesgo
               </div>
               <div className="text-3xl font-black text-white">
                 {playerProfile.averageSeverity.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 4.0</span>
               </div>
             </div>
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 flex items-center justify-center lg:justify-start gap-1">
                 <Target className="w-3 h-3 text-orange-400" /> Talón de Aquiles
               </div>
               <div className="text-xl font-bold text-white capitalize">{weakness}</div>
             </div>
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 relative overflow-hidden">
               <div className="text-[10px] text-blue-300 uppercase font-bold tracking-wider mb-2">Desempeño Cognitivo</div>
               <div className="text-4xl font-black text-blue-400" style={{ textShadow: '0 0 30px rgba(59,130,246,0.5)' }}>
                 {Math.round(overallScore)}%
               </div>
             </div>
           </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Technical Radar & Stats */}
          <div className="space-y-8">
            <div className="bg-[#161b28] border border-white/5 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                Huella Técnica
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                    <Radar name="Precisión" dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-slate-400 text-sm text-center mt-4">
                Mapeo de tu resistencia y precisión técnica a lo largo de las distintas fases y dominios del juego.
              </p>
            </div>
            
            {/* Pedagogical Diagnosis (The "Why") */}
            <div className="bg-gradient-to-br from-[#161b28] to-[#0f1420] border border-blue-500/20 rounded-3xl p-8 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Comportamiento Cognitivo
              </h2>
              <p className="text-slate-400 text-sm mb-6">¿Por qué cometes los errores? Este es el análisis de tu proceso de pensamiento subyacente.</p>
              
              <div className="space-y-5">
                {causesData.slice(0, 3).map((cause, idx) => (
                   <div key={idx} className="relative">
                     <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-slate-200 capitalize">{cause.fullName}</span>
                       <span className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">x{cause.frecuencia} incidentes</span>
                     </div>
                     <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                       <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${(cause.frecuencia / causesData[0].frecuencia) * 100}%` }}></div>
                     </div>
                   </div>
                ))}
                {causesData.length === 0 && (
                  <div className="text-slate-500 text-sm italic py-4">No se han detectado patrones cognitivos graves aún. ¡Sigue jugando de forma limpia!</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Plan de Entrenamiento */}
          <div className="space-y-8">
            <div className="bg-[#161b28] border border-white/5 rounded-3xl p-8 shadow-xl h-full flex flex-col">
               <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <Lightbulb className="w-5 h-5 text-green-400" />
                 Plan de Entrenamiento Dinámico
               </h2>
               <p className="text-slate-400 text-sm mb-8">Ejercicios personalizados generados a partir de tu diagnóstico cognitivo para maximizar la curva de aprendizaje.</p>

               <div className="space-y-4 flex-1">
                 {trainingPriorities.map((tp, idx) => (
                   <div key={idx} className="group relative bg-[#0a0e17] border border-slate-800 rounded-2xl p-5 hover:border-green-500/50 transition-all cursor-pointer overflow-hidden">
                     {/* Hover glow */}
                     <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-1000"></div>
                     
                     <div className="flex items-start gap-4 relative z-10">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${idx === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500'}`}>
                         #{idx + 1}
                       </div>
                       <div className="flex-1">
                         <h3 className="text-white font-bold leading-tight mb-1">{tp.description}</h3>
                         <div className="flex flex-wrap gap-2 mt-3">
                           <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded">Causa: {tp.cause.split(' ')[0]}</span>
                           <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded">Dominio: {tp.technicalType}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}

                 {trainingPriorities.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                     <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                     <p>Juega más partidas para generar prioridades sólidas.</p>
                   </div>
                 )}
               </div>

               <div className="mt-8 pt-6 border-t border-slate-800">
                 <button className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] flex items-center justify-center gap-2">
                   <Target className="w-5 h-5" /> Iniciar Sesión de Gimnasio
                 </button>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerProfile;
