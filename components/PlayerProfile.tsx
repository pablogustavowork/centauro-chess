import React from 'react';
import { UserProfile, PlayerStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { Settings, Share2, AlertTriangle, Lightbulb } from 'lucide-react';

interface PlayerProfileProps {
  profile: UserProfile;
  stats?: PlayerStats;
}

const defaultStats: PlayerStats = {
  apertura: 75,
  tactica: 92,
  finales: 45,
  estrategia: 82,
  defensa: 48,
  calculo: 88,
  manejoTiempo: 60
}; 
// Added missing stats for mock.

const PlayerProfile: React.FC<PlayerProfileProps> = ({ profile, stats = defaultStats }) => {
  // Mock Data for Bar Chart
  const barData = [
    { name: 'APERTURA', value: stats.apertura },
    { name: 'TÁCTICA', value: stats.tactica },
    { name: 'FINALES', value: stats.finales },
    { name: 'ESTRATEGIA', value: stats.estrategia },
    { name: 'VELOCIDAD', value: stats.manejoTiempo },
  ];

  // Mock Data for Line Chart (Evolution)
  const evolutionData = [
    { month: 'M1', tactica: 55, promedio: 40 },
    { month: 'M2', tactica: 65, promedio: 45 },
    { month: 'M3', tactica: 75, promedio: 52 },
    { month: 'M4', tactica: 80, promedio: 48 },
    { month: 'M5', tactica: 72, promedio: 55 },
    { month: 'M6', tactica: 92, promedio: 60 },
  ];

  const overallScore = Math.round(
    (stats.tactica + stats.apertura + stats.finales + stats.estrategia + stats.manejoTiempo) / 5
  );

  return (
    <div className="min-h-screen bg-[#0f1420] text-slate-200 font-sans p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header Container */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
               <span className="font-serif text-xl font-bold text-white">♟</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CentaUros Chess</span>
          </div>
          <div className="flex gap-3">
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-[#161b28] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl relative overflow-hidden">
           {/* Glow effect */}
           <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none"></div>
           
           {/* Avatar Area */}
           <div className="flex-shrink-0 relative">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-1">
               <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-[#161b28]">
                 <span className="text-3xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
               </div>
             </div>
             <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#161b28]"></div>
           </div>

           {/* Details */}
           <div className="flex-1 text-center md:text-left">
             <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
             <div className="text-blue-400 font-bold mb-2">Maestro Internacional</div>
             <div className="text-slate-500 text-sm font-mono mb-6 md:mb-0">ID: 772934 | Rank #422 Global</div>
           </div>

           {/* Stats Summary */}
           <div className="flex flex-col sm:flex-row gap-6 md:gap-12 w-full md:w-auto text-center md:text-left">
             <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">ESTILO</div>
               <div className="text-lg font-bold text-white">Agresor Táctico</div>
             </div>
             <div className="hidden sm:block w-px h-12 bg-white/10"></div>
             <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">FORTALEZA PRINCIPAL</div>
               <div className="text-lg font-bold text-white">Cálculo</div>
             </div>
             <div className="hidden sm:block w-px h-12 bg-white/10"></div>
             <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">DEBILIDAD</div>
               <div className="text-lg font-bold text-white">Técnica de Finales</div>
             </div>
           </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column (Charts) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Skills Radar / Bar Chart */}
            <div className="bg-[#161b28] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Índice de Rendimiento de Habilidades</h2>
                  <p className="text-slate-400 text-sm">Rendimiento en tiempo real en 5 dimensiones clave</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-blue-400" style={{ textShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                    {overallScore}<span className="text-lg text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-green-400 text-sm font-bold flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs">↗</span> +2.4%
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={8}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                       {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value < 50 ? '#3b82f6' /* muted blue for low */ : '#3b82f6'} style={{ opacity: entry.value < 50 ? 0.6 : 1 }} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Evolution Line Chart */}
            <div className="bg-[#161b28] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Evolución de Habilidades (Últimos 6 Meses)</h2>
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTactica" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px' }}
                       itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="tactica" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTactica)" />
                    <Area type="monotone" dataKey="promedio" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute bottom-0 left-0 flex gap-6 text-xs font-bold text-slate-500 uppercase">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Táctica</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-slate-500 border-dashed"></div> Promedio General</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Errors & Coach) */}
          <div className="space-y-6">
            
            {/* Recurrent Errors */}
            <div className="bg-[#161b28] border border-white/5 rounded-2xl p-6 shadow-xl h-full flex flex-col">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Ranking de Errores Recurrentes
              </h2>

              <div className="space-y-4 flex-1">
                {/* Error Card 1 */}
                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold bg-red-500/10 px-2 rounded">#1</span>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">Piezas colgadas bajo presión</h4>
                      <p className="text-xs text-slate-500 mb-3">Ocurre en 24% de partidas blitz con &lt; 1min restante.</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Card 2 */}
                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold bg-orange-500/10 px-2 rounded">#2</span>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">Error de cálculo en intercambios</h4>
                      <p className="text-xs text-slate-500 mb-3">Frecuente durante medios juegos complejos.</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Card 3 */}
                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 rounded">#3</span>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">Defensa pasiva en finales</h4>
                      <p className="text-xs text-slate-500 mb-3">Tendencia a posiciones perdidas en finales de torres.</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-yellow-500 h-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Insights */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                  <Lightbulb className="w-3 h-3" /> Visión del Entrenador
                </div>
                <p className="text-sm text-blue-100/80 italic leading-relaxed">
                  "{profile.name} shows elite tactical vision, but loses composure in time scrambles. Focused training on Lucena/Philidor positions is recommended."
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
           <div className="bg-[#161b28] border border-white/5 rounded-xl p-5 shadow-lg">
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">TASA DE VICTORIAS</div>
             <div className="text-2xl font-bold text-white">58.4%</div>
           </div>
           <div className="bg-[#161b28] border border-white/5 rounded-xl p-5 shadow-lg">
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">PARTIDAS JUGADAS</div>
             <div className="text-2xl font-bold text-white">1,248</div>
           </div>
           {/* Contextual Status Bar */}
           <div className="col-span-2 bg-[#0a0e17] border border-white/5 rounded-xl p-5 flex flex-wrap items-center justify-center md:justify-around gap-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Forma actual: Excelente</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Elo máximo: 2450</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Próximo Torneo: Centauros Masters</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerProfile;
