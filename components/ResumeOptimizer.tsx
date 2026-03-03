'use client';

import { useState, useCallback } from 'react';
import {
    Sparkles,
    Loader2,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    AlertCircle,
    Clock,
    Brain,
    Target,
    Zap,
    MessageSquare,
    ListChecks,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AiResponse {
    score: number;
    missingSkills: string[];
    keywordSuggestions: string[];
    improvedBullets: { original: string; improved: string }[];
    feedbackSummary: string;
}

interface ResumeAnalysis {
    id: string;
    score: number;
    aiResponse: AiResponse;
    createdAt: string;
    jobDescription: string;
}

interface ResumeOptimizerProps {
    applicationId: string;
    companyName: string;
    role: string;
    initialAnalyses: ResumeAnalysis[];
}

// ─── Helper: Score Badge ─────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
    const isGreen = score >= 80;
    const isYellow = score >= 50 && score < 80;

    const colorClasses = isGreen
        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
        : isYellow
            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400';

    const ringColor = isGreen
        ? 'stroke-emerald-400'
        : isYellow
            ? 'stroke-yellow-400'
            : 'stroke-red-400';

    const circumference = 2 * Math.PI * 20;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${colorClasses}`}>
            {/* Circular Progress */}
            <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-20" />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${ringColor} transition-all duration-700`}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {score}
                </span>
            </div>

            <div>
                <p className="text-xs uppercase tracking-widest opacity-70 font-semibold">Match Score</p>
                <p className="text-2xl font-bold">{score}/100</p>
                <p className="text-xs opacity-70 mt-0.5">
                    {isGreen ? 'Excellent match 🎉' : isYellow ? 'Good match, room to improve' : 'Needs significant improvement'}
                </p>
            </div>
        </div>
    );
}

// ─── Helper: Collapsible Section ─────────────────────────────────────────────

function Section({
    icon,
    title,
    count,
    accentColor,
    children,
    defaultOpen = false,
}: {
    icon: React.ReactNode;
    title: string;
    count?: number;
    accentColor: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${accentColor}`}>{icon}</span>
                    <span className="font-semibold text-slate-200 text-sm">{title}</span>
                    {count !== undefined && (
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
            </button>

            {open && <div className="px-5 pb-5 pt-1">{children}</div>}
        </div>
    );
}

// ─── Helper: Copy Button ─────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 text-slate-500 hover:text-brand-400 hover:bg-brand-400/10 rounded-md transition-all"
            title="Copy to clipboard"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
        </button>
    );
}

// ─── Analysis Result Card ─────────────────────────────────────────────────────

function AnalysisResult({ analysis, compact = false }: { analysis: ResumeAnalysis; compact?: boolean }) {
    const ai = analysis.aiResponse;

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-4">
                <div>
                    <ScoreBadge score={analysis.score} />
                </div>
                <p className="text-xs text-slate-500">
                    {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Score */}
            <ScoreBadge score={ai.score} />

            {/* Feedback Summary */}
            <Section
                icon={<MessageSquare className="w-4 h-4" />}
                title="Overall Feedback"
                accentColor="bg-purple-500/15 text-purple-400"
                defaultOpen
            >
                <p className="text-slate-300 text-sm leading-relaxed">{ai.feedbackSummary}</p>
            </Section>

            {/* Missing Skills */}
            <Section
                icon={<AlertCircle className="w-4 h-4" />}
                title="Missing Skills"
                count={ai.missingSkills.length}
                accentColor="bg-red-500/15 text-red-400"
                defaultOpen
            >
                {ai.missingSkills.length === 0 ? (
                    <p className="text-slate-500 text-sm">No critical missing skills — great coverage!</p>
                ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {ai.missingSkills.map((skill, i) => (
                            <span
                                key={i}
                                className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </Section>

            {/* Keyword Suggestions */}
            <Section
                icon={<Zap className="w-4 h-4" />}
                title="ATS Keyword Suggestions"
                count={ai.keywordSuggestions.length}
                accentColor="bg-brand-500/15 text-brand-400"
                defaultOpen
            >
                {ai.keywordSuggestions.length === 0 ? (
                    <p className="text-slate-500 text-sm">Keywords look well-optimized!</p>
                ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {ai.keywordSuggestions.map((kw, i) => (
                            <span
                                key={i}
                                className="text-xs bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1 rounded-full"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                )}
            </Section>

            {/* Improved Bullets */}
            <Section
                icon={<ListChecks className="w-4 h-4" />}
                title="Improved Resume Bullets"
                count={ai.improvedBullets.length}
                accentColor="bg-emerald-500/15 text-emerald-400"
                defaultOpen
            >
                {ai.improvedBullets.length === 0 ? (
                    <p className="text-slate-500 text-sm">No bullet improvements suggested.</p>
                ) : (
                    <div className="space-y-4 mt-1">
                        {ai.improvedBullets.map((b, i) => (
                            <div key={i} className="space-y-2">
                                {b.original && b.original !== 'N/A' && (
                                    <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <span className="text-xs text-red-400 font-semibold uppercase tracking-wider flex-shrink-0 mt-0.5">Before</span>
                                        <p className="text-slate-400 text-sm leading-relaxed">{b.original}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">After</span>
                                        <p className="text-slate-200 text-sm leading-relaxed mt-1">{b.improved}</p>
                                    </div>
                                    <CopyButton text={b.improved} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function AnalysisSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-slate-800 rounded-xl" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-800/60 rounded-xl" />
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResumeOptimizer({
    applicationId,
    companyName,
    role,
    initialAnalyses,
}: ResumeOptimizerProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeContent, setResumeContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [analyses, setAnalyses] = useState<ResumeAnalysis[]>(initialAnalyses);
    const [latestResult, setLatestResult] = useState<ResumeAnalysis | null>(null);
    const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnalyze = useCallback(async () => {
        if (isAnalyzing) return;
        if (!jobDescription.trim() || !resumeContent.trim()) {
            setError('Please fill in both the Job Description and Resume Content.');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setLatestResult(null);

        try {
            const res = await fetch(`/api/applications/${applicationId}/resume-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription, resumeContent }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Analysis failed. Please try again.');
            }

            setLatestResult(data);
            setAnalyses((prev) => [data, ...prev]);
            // Scroll to results
            setTimeout(() => {
                document.getElementById('optimizer-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [applicationId, jobDescription, resumeContent, isAnalyzing]);

    return (
        <div className="space-y-4">
            {/* Header Toggle Card */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-500/15 rounded-xl">
                            <Brain className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">AI Resume Optimizer</h2>
                            <p className="text-slate-500 text-xs mt-0.5">
                                Powered by Gemini · {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''} saved
                            </p>
                        </div>
                    </div>
                    <button
                        id="toggle-optimizer"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        {isExpanded ? 'Close Optimizer' : 'Optimize Resume for This Job'}
                    </button>
                </div>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
                <div className="space-y-4">
                    {/* Input Form */}
                    <div className="card space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-brand-400" />
                            <h3 className="text-sm font-semibold text-slate-200">
                                Analyzing for: <span className="text-brand-400">{role}</span> at{' '}
                                <span className="text-white">{companyName}</span>
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Job Description *
                            </label>
                            <textarea
                                id="job-description-input"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="input-field resize-none font-mono text-xs leading-relaxed"
                                rows={8}
                                placeholder="Paste the full job description here..."
                                disabled={isAnalyzing}
                            />
                            <p className="text-xs text-slate-600 mt-1">{jobDescription.length} characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Your Resume Content *
                            </label>
                            <textarea
                                id="resume-content-input"
                                value={resumeContent}
                                onChange={(e) => setResumeContent(e.target.value)}
                                className="input-field resize-none font-mono text-xs leading-relaxed"
                                rows={10}
                                placeholder="Paste your resume content here (plain text works best)..."
                                disabled={isAnalyzing}
                            />
                            <p className="text-xs text-slate-600 mt-1">{resumeContent.length} characters</p>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            id="analyze-resume-btn"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !jobDescription.trim() || !resumeContent.trim()}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Analyze Resume
                                </>
                            )}
                        </button>
                    </div>

                    {/* Live Skeleton / Result */}
                    {isAnalyzing && (
                        <div className="card">
                            <div className="flex items-center gap-2 mb-5">
                                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                                <p className="text-sm text-brand-400 font-medium">AI is analyzing your resume…</p>
                            </div>
                            <AnalysisSkeleton />
                        </div>
                    )}

                    {latestResult && !isAnalyzing && (
                        <div id="optimizer-result" className="card space-y-5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-brand-400" />
                                <h3 className="font-semibold text-white">Latest Analysis Result</h3>
                                <span className="text-xs text-slate-500 ml-auto">
                                    {new Date(latestResult.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <AnalysisResult analysis={latestResult} />
                        </div>
                    )}
                </div>
            )}

            {/* ─── History ─────────────────────────────────────────────────────── */}
            {analyses.length > 0 && (
                <div className="card space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <h3 className="font-semibold text-white text-sm">
                            Analysis History
                            <span className="ml-2 text-xs text-slate-500 font-normal">
                                ({analyses.length} saved)
                            </span>
                        </h3>
                    </div>

                    <div className="space-y-2">
                        {analyses.map((a, idx) => (
                            <div key={a.id} className="border border-slate-800 rounded-xl overflow-hidden">
                                <button
                                    onClick={() =>
                                        setExpandedHistory(expandedHistory === a.id ? null : a.id)
                                    }
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${a.score >= 80
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : a.score >= 50
                                                        ? 'bg-yellow-500/15 text-yellow-400'
                                                        : 'bg-red-500/15 text-red-400'
                                                }`}
                                        >
                                            {a.score}/100
                                        </span>
                                        <span className="text-slate-400 text-xs">
                                            {idx === 0 ? '(Latest) ' : ''}
                                            {new Date(a.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    {expandedHistory === a.id ? (
                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>

                                {expandedHistory === a.id && (
                                    <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800">
                                        <AnalysisResult analysis={a} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
