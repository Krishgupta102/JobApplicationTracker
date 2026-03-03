import clsx from 'clsx';
import { ApplicationStatus } from '@prisma/client';

interface StatusBadgeProps {
    status: ApplicationStatus;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
    Applied: {
        label: 'Applied',
        className: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20',
    },
    Interview: {
        label: 'Interview',
        className: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
    },
    Offer: {
        label: 'Offer',
        className: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
    },
    Rejected: {
        label: 'Rejected',
        className: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20',
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                config.className
            )}
        >
            {config.label}
        </span>
    );
}
