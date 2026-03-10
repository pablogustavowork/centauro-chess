
import React from 'react';
import { UserProfile, GameData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Upload, Play, Trophy, Eye, Clock, CheckCircle, ArrowRight, FlaskConical, Dumbbell } from 'lucide-react';

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
}

const Dashboard: React.FC<DashboardProps> = ({ profile, history, onUploadClick, onTrainingClick, onVisorClick, onDirectPgnLoad, onReviewGame, onTrainGame }) => {

  // Mock Data for the slick graph
  const trendData = history.length > 0
    ? history.map((g, i) => ({ name: `J${i + 1}`, cpl: g.averageCpl }))
    : [
      { name: 'SEM 1', cpl: 35 }, { name: 'SEM 2', cpl: 28 }, { name: 'SEM 3', cpl: 22 },
      { name: 'SEM 4', cpl: 18 }, { name: 'SEM 5', cpl: 12 }, { name: 'HOY', cpl: 9.5 } // Data matching image curve better
    ];

  const currentCpl = history.length > 0 ? history[history.length - 1].averageCpl : 18.5; // Example value from image
  const improvement = "-12%"; // Example value from image

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

      {/* Top Row: Metrics & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Graph Card */}
        <div className="lg:col-span-2">
          <CPLTrendGraph data={trendData} currentCpl={currentCpl} improvement={improvement} />
        </div>

        {/* Side KPIs */}
        <div className="space-y-6">
          {/* Problems Solved */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[154px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500"><Target className="w-5 h-5" /></div>
              <span className="text-slate-300 font-bold">Problemas Resueltos</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white">1,248</div>
              <div className="text-sm text-slate-500 mt-1">+12 hoy</div>
            </div>
          </div>

          {/* Study Time */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[154px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500"><Clock className="w-5 h-5" /></div>
              <span className="text-slate-300 font-bold">Tiempo de Estudio</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white">42h</div>
              <div className="text-sm text-slate-500 mt-1">Esta semana</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access (Action Cards) */}
      <h2 className="flex items-center gap-2 text-xl font-bold text-white mt-8">
        <span className="text-blue-500">⚡</span> Accesos Rápidos
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

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="flex items-center justify-between text-xl font-bold text-white mt-8 mb-6">
          <span>Actividad Reciente</span>
          <button className="text-sm text-blue-500 hover:text-blue-400 font-medium cursor-pointer">Ver todo</button>
        </h2>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay actividad reciente. Juega una partida para empezar.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.slice(0, 5).map((game) => (
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
