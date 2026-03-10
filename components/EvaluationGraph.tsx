
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EvaluationGraphProps {
    data: { ply: number; score: number }[];
    height?: number;
    activePly?: number;
}

const EvaluationGraph: React.FC<EvaluationGraphProps> = ({ data, height = 200, activePly }) => {
    // Normalize data for graph (-500 to +500 cap)
    const chartData = data.map(d => ({
        ...d,
        cappedScore: Math.max(-500, Math.min(500, d.score))
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={0.5} stopColor="#4ade80" stopOpacity={0.8} />
                        <stop offset={0.5} stopColor="#334155" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelFormatter={(label) => `Jugada ${Math.ceil(label / 2)}`}
                />
                <Area
                    type="monotone"
                    dataKey="cappedScore"
                    stroke="#4ade80"
                    fill="url(#splitColor)"
                    strokeWidth={2}
                    baseLine={0}
                />
                {/* Zero Line */}
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />

                {/* Active Ply Indicator */}
                {activePly !== undefined && (
                    <ReferenceLine x={activePly} stroke="#ffffff" strokeWidth={2} isFront />
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default EvaluationGraph;
