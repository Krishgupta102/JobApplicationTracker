import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ResumeOptimizer } from '@/components/ResumeOptimizer';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, FileText, StickyNote } from 'lucide-react';

interface ApplicationDetailPageProps {
    params: { id: string };
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const application = await prisma.application.findUnique({
        where: { id: params.id },
        include: {
            resumeAnalyses: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!application || application.userId !== session.user.id) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Link */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            {/* Application Info Card */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{application.companyName}</h1>
                        <p className="text-slate-300 text-lg mt-1">{application.role}</p>
                    </div>
                    <StatusBadge status={application.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-brand-500/10 rounded-lg">
                            <Briefcase className="w-4 h-4 text-brand-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Status</p>
                            <p className="text-slate-200 font-medium">{application.status}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Interview Date</p>
                            <p className="text-slate-200 font-medium">
                                {application.interviewDate
                                    ? new Date(application.interviewDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : 'Not scheduled'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Applied On</p>
                            <p className="text-slate-200 font-medium">
                                {new Date(application.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {application.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-start gap-2">
                            <StickyNote className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-400 text-sm leading-relaxed">{application.notes}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Resume Optimizer */}
            <ResumeOptimizer
                applicationId={application.id}
                companyName={application.companyName}
                role={application.role}
                initialAnalyses={application.resumeAnalyses as any}
            />
        </div>
    );
}
