'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface ChartData {
    status: string;
    count: number;
}

const statusColors: Record<string, string> = {
    Applied: '#6366f1',
    Interview: '#eab308',
    Offer: '#22c55e',
    Rejected: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-lg">
                <p className="font-medium text-white">{label}</p>
                <p className="text-slate-300">{payload[0].value} applications</p>
            </div>
        );
    }
    return null;
};

export function StatusBarChart({ data }: { data: ChartData[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis
                    dataKey="status"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.map((entry) => (
                        <Cell
                            key={entry.status}
                            fill={statusColors[entry.status] ?? '#6366f1'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
