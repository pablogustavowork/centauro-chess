import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CPLTrendGraphProps {
    data: { name: string; cpl: number }[];
    currentCpl: number;
    improvement: string;
}

const CPLTrendGraph: React.FC<CPLTrendGraphProps> = ({ data, currentCpl, improvement }) => {
    const [period, setPeriod] = useState<'Semana' | 'Mes' | 'Año'>('Mes');

    // Filter/Mock data based on period (optional visual effect)
    const effectiveData = data;

    return (
        <div className="bg-[#12141e] rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-bold text-xl mb-1">Tendencia de CPL</h3>
                    <p className="text-slate-500 text-sm">Evolución de Pérdida Promedio de Centipeones</p>
                </div>

                {/* Toggle Pill - Exact replica */}
                <div className="bg-[#1e2330] rounded-lg p-1 flex text-xs font-semibold">
                    {(['Semana', 'Mes', 'Año'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-md transition-all ${period === p
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Big Metrics */}
            <div className="flex items-end gap-4 mb-8">
                <div>
                    <span className="text-5xl font-black text-white tracking-tighter block leading-none">
                        {Number(currentCpl).toFixed(1)}
                    </span>
                    <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mt-2 block">
                        CPL Promedio Actual
                    </span>
                </div>

                <div className="mb-1">
                    <span className="bg-[#1a2e25] text-green-400 px-3 py-1.5 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-1">
                        ↘ {improvement} mejora
                    </span>
                </div>
            </div>

            {/* Graph Area */}
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectiveData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCplExact" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cpl"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorCplExact)"
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CPLTrendGraph;
