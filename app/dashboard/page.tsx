import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { StatsCard } from '@/components/StatsCard';
import { ApplicationsTable } from '@/components/ApplicationsTable';
import { StatusBarChart } from '@/components/StatusBarChart';
import {
    Briefcase,
    Calendar,
    Trophy,
    XCircle,
} from 'lucide-react';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    const total = applications.length;
    const interviews = applications.filter((a) => a.status === 'Interview').length;
    const offers = applications.filter((a) => a.status === 'Offer').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    const chartData = [
        { status: 'Applied', count: applications.filter((a) => a.status === 'Applied').length },
        { status: 'Interview', count: interviews },
        { status: 'Offer', count: offers },
        { status: 'Rejected', count: rejected },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Welcome back! Here&apos;s your job search overview.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Applications"
                    value={total}
                    icon={Briefcase}
                    color="brand"
                />
                <StatsCard
                    title="Interviews"
                    value={interviews}
                    icon={Calendar}
                    color="yellow"
                />
                <StatsCard
                    title="Offers"
                    value={offers}
                    icon={Trophy}
                    color="green"
                />
                <StatsCard
                    title="Rejected"
                    value={rejected}
                    icon={XCircle}
                    color="red"
                />
            </div>

            {/* Chart + Table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="card xl:col-span-1">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Applications by Status
                    </h2>
                    <StatusBarChart data={chartData} />
                </div>

                <div className="xl:col-span-2">
                    <ApplicationsTable initialApplications={applications} />
                </div>
            </div>
        </div>
    );
}
