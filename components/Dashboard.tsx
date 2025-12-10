
import React from 'react';
import { UserProfile, GameData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Upload, Play, Trophy, Eye } from 'lucide-react';


interface DashboardProps {
  profile: UserProfile;
  history: GameData[];
  onUploadClick: () => void; // Legacy
  onTrainingClick: () => void; // Legacy (now reused/ignored)
  onVisorClick: () => void;
  onDirectPgnLoad: (pgn: string, mode: 'analysis' | 'viewer') => void;
}


const Dashboard: React.FC<DashboardProps> = ({ profile, history, onUploadClick, onTrainingClick, onVisorClick, onDirectPgnLoad }) => {
  // ... (chart data logic) ...
  const [directPgn, setDirectPgn] = React.useState('');

  const handleDirectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setDirectPgn(event.target.result as string);
    };
    reader.readAsText(file);
  };

  // Mock trend data if history is empty
  const data = history.length > 0 ? history.map((g, i) => ({
    name: `Partida ${i + 1}`,
    cpl: g.averageCpl
  })) : [
    { name: 'P1', cpl: 65 }, { name: 'P2', cpl: 58 }, { name: 'P3', cpl: 72 },
    { name: 'P4', cpl: 45 }, { name: 'P5', cpl: 40 }
  ];

  const recentError = history.length > 0 ? history[history.length - 1].dominantError : 'Datos insuficientes';


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ... Header ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bienvenido de nuevo, {profile.name}</h1>
          <p className="text-slate-400">ELO Actual: <span className="text-green-400 font-mono font-bold">{profile.elo}</span></p>
        </div>
        <button className="hidden md:block opacity-0 cursor-default" aria-hidden="true"></button>
      </div>


      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Card 1: Analysis (Green) */}
        <button
          onClick={onUploadClick}
          className="group relative h-80 bg-slate-800 rounded-2xl border border-slate-700 p-8 text-left hover:border-green-500 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
        >
          <div className="absolute top-8 right-8 bg-green-900/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-green-500" />
          </div>
          <div className="h-full flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Analizar Nueva Partida</h3>
            <p className="text-slate-400">Ir a la pantalla completa de carga para análisis profundo con Stockfish 16.</p>
          </div>
        </button>

        {/* Card 2: Direct Load (Blue) - Interactive */}
        <div className="relative h-80 bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col gap-4 hover:border-blue-500 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
          <div className="absolute top-6 right-6 bg-blue-900/20 p-3 rounded-xl">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>

          <h3 className="text-xl font-bold text-white text-blue-400">Carga Rápida</h3>

          <textarea
            className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 resize-none focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Pega PGN aquí..."
            value={directPgn}
            onChange={(e) => setDirectPgn(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-1">
              <span className="truncate">📂 Archivo</span>
              <input type="file" accept=".pgn" onChange={handleDirectFile} className="hidden" />
            </label>
            <button
              onClick={() => setDirectPgn('')}
              className="bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 text-xs font-bold py-2 rounded-lg transition-colors"
              disabled={!directPgn}
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDirectPgnLoad(directPgn, 'analysis')}
              disabled={!directPgn}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-colors"
            >
              Analizar
            </button>
            <button
              onClick={() => onDirectPgnLoad(directPgn, 'viewer')}
              disabled={!directPgn}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-colors"
            >
              Ver
            </button>
          </div>
        </div>


        {/* Visor PGN Button */}
        <button
          onClick={onVisorClick}
          className="group relative h-64 bg-slate-800 rounded-2xl border border-slate-700 p-8 text-left hover:border-indigo-500 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] md:col-span-2 lg:col-span-1"
        >
          <div className="absolute top-8 right-8 bg-indigo-900/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
            <Eye className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="h-full flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Visor PGN</h3>
            <p className="text-slate-400">Carga y reproduce partidas libremente sin análisis. Ideal para revisión rápida.</p>
          </div>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Tendencia de Precisión (ACPL)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="cpl" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Rec */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-4 bg-green-900/20 rounded-lg">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Enfoque Diario</h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="bg-slate-900 p-4 rounded-full border-2 border-slate-700">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider">Debilidad Identificada</p>
              <h3 className="text-xl font-bold text-white mt-1">{recentError}</h3>
            </div>
            <p className="text-sm text-slate-500 px-4">
              Basado en tus últimas {history.length || 5} partidas, recomendamos ejercicios tácticos enfocados en esta área.
            </p>
          </div>

          <button
            onClick={onTrainingClick}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20">
            <Play className="w-4 h-4 fill-current" /> Iniciar Entrenamiento
          </button>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="font-bold text-slate-200">Análisis Reciente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/50 uppercase text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Jugadores</th>
                <th className="px-6 py-3">Resultado</th>
                <th className="px-6 py-3 text-right">ACPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {history.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center">Aún no hay partidas analizadas.</td></tr>
              ) : history.map((g) => (
                <tr key={g.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">{g.date}</td>
                  <td className="px-6 py-4 text-white">{g.white} vs {g.black}</td>
                  <td className="px-6 py-4">{g.result}</td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${g.averageCpl > 50 ? 'text-red-400' : 'text-green-400'}`}>
                    {g.averageCpl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
