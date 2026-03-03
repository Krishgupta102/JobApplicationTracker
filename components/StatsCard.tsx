import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color: 'brand' | 'yellow' | 'green' | 'red';
}

const colorMap = {
    brand: {
        bg: 'bg-brand-500/10',
        icon: 'text-brand-400',
        value: 'text-brand-300',
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        icon: 'text-yellow-400',
        value: 'text-yellow-300',
    },
    green: {
        bg: 'bg-green-500/10',
        icon: 'text-green-400',
        value: 'text-green-300',
    },
    red: {
        bg: 'bg-red-500/10',
        icon: 'text-red-400',
        value: 'text-red-300',
    },
};

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div className="card hover:border-slate-700 transition-colors duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className={clsx('text-4xl font-bold mt-2', colors.value)}>
                        {value}
                    </p>
                </div>
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
                    <Icon className={clsx('w-5 h-5', colors.icon)} />
                </div>
            </div>
        </div>
    );
}
