'use client';

import { useState, useCallback, useRef } from 'react';
import {
    Sparkles,
    Loader2,
    Upload,
    FileText,
    X,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    AlertCircle,
    MessageSquare,
    ListChecks,
    Zap,
    Brain,
    Target,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AiBullet {
    original: string;
    improved: string;
}

interface AnalysisResult {
    score: number;
    missingSkills: string[];
    keywordSuggestions: string[];
    improvedBullets: AiBullet[];
    feedbackSummary: string;
    extractedResumeLength?: number;
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

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

    const circumference = 2 * Math.PI * 22;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className={`flex items-center gap-5 px-6 py-5 rounded-2xl border ${colorClasses}`}>
            <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-20" />
                    <circle
                        cx="26" cy="26" r="22" fill="none" strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${ringColor} transition-all duration-1000`}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold">
                    {score}
                </span>
            </div>
            <div>
                <p className="text-xs uppercase tracking-widest opacity-60 font-semibold">Match Score</p>
                <p className="text-3xl font-bold">{score}<span className="text-lg opacity-60">/100</span></p>
                <p className="text-xs opacity-60 mt-1">
                    {isGreen ? '🎉 Excellent match!' : isYellow ? '⚡ Good match — room to improve' : '🔴 Needs significant improvement'}
                </p>
            </div>
        </div>
    );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function Section({
    icon, title, count, accentColor, children, defaultOpen = false,
}: {
    icon: React.ReactNode; title: string; count?: number;
    accentColor: string; children: React.ReactNode; defaultOpen?: boolean;
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
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{count}</span>
                    )}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {open && <div className="px-5 pb-5 pt-1">{children}</div>}
        </div>
    );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={handleCopy} title="Copy" className="flex-shrink-0 p-1.5 text-slate-500 hover:text-brand-400 hover:bg-brand-400/10 rounded-md transition-all">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="space-y-4 animate-pulse mt-6">
            <div className="h-24 bg-slate-800 rounded-2xl" />
            {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-800/70 rounded-xl" />)}
        </div>
    );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({
    file, onFile, disabled,
}: {
    file: File | null; onFile: (f: File | null) => void; disabled: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
    }

    return (
        <div
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragging
                    ? 'border-brand-400 bg-brand-400/10'
                    : file
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-slate-700 hover:border-brand-500/60 hover:bg-brand-500/5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                disabled={disabled}
                onChange={e => onFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-emerald-500/15 rounded-lg">
                        <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onFile(null); }}
                        className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div>
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">
                        Drop your resume here or <span className="text-brand-400">browse</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Supports PDF, DOCX, DOC, TXT · Max 5MB</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StandaloneResumeOptimizer() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (isAnalyzing) return;
        if (!resumeFile) { setError('Please upload your resume file.'); return; }
        if (!jobDescription.trim()) { setError('Please paste the job description.'); return; }

        setIsAnalyzing(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', jobDescription);

        try {
            const res = await fetch('/api/resume-optimizer', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed. Please try again.');
            setResult(data);
            setTimeout(() => {
                document.getElementById('optimizer-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [resumeFile, jobDescription, isAnalyzing]);

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-500/15 rounded-xl">
                        <Brain className="w-6 h-6 text-brand-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">AI Resume Optimizer</h1>
                </div>
                <p className="text-slate-400 text-sm">
                    Upload your resume and paste a job description. Our AI will analyze the full document and give you tailored suggestions to maximize your match score.
                </p>
            </div>

            {/* Input Card */}
            <div className="card space-y-6">
                {/* Resume Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-brand-400" />
                        Resume File *
                    </label>
                    <FileUploadZone file={resumeFile} onFile={setResumeFile} disabled={isAnalyzing} />
                </div>

                {/* Job Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand-400" />
                        Job Description *
                    </label>
                    <textarea
                        id="jd-input"
                        value={jobDescription}
                        onChange={e => setJobDescription(e.target.value)}
                        className="input-field resize-none font-mono text-xs leading-relaxed"
                        rows={9}
                        placeholder="Paste the full job description here — include requirements, responsibilities, and skills..."
                        disabled={isAnalyzing}
                    />
                    <p className="text-xs text-slate-600 mt-1">{jobDescription.length} characters</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    id="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
                >
                    {isAnalyzing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Analyzing your resume with AI...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" />Analyze My Resume</>
                    )}
                </button>
            </div>

            {/* Loading Skeleton */}
            {isAnalyzing && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-1">
                        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                        <p className="text-sm text-brand-400 font-medium">AI is reading your full resume and analyzing it...</p>
                    </div>
                    <Skeleton />
                </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
                <div id="optimizer-result" className="card space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-400" />
                            <h2 className="font-semibold text-white">Analysis Results</h2>
                        </div>
                        {result.extractedResumeLength && (
                            <span className="text-xs text-slate-500">
                                {result.extractedResumeLength.toLocaleString()} characters extracted from resume
                            </span>
                        )}
                    </div>

                    {/* Score */}
                    <ScoreBadge score={result.score} />

                    {/* Feedback */}
                    <Section
                        icon={<MessageSquare className="w-4 h-4" />}
                        title="Overall Feedback"
                        accentColor="bg-purple-500/15 text-purple-400"
                        defaultOpen
                    >
                        <p className="text-slate-300 text-sm leading-relaxed">{result.feedbackSummary}</p>
                    </Section>

                    {/* Missing Skills */}
                    <Section
                        icon={<AlertCircle className="w-4 h-4" />}
                        title="Missing Skills"
                        count={result.missingSkills.length}
                        accentColor="bg-red-500/15 text-red-400"
                        defaultOpen
                    >
                        {result.missingSkills.length === 0 ? (
                            <p className="text-slate-500 text-sm">No critical missing skills! Great match.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {result.missingSkills.map((s, i) => (
                                    <span key={i} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full">{s}</span>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Keywords */}
                    <Section
                        icon={<Zap className="w-4 h-4" />}
                        title="ATS Keyword Suggestions"
                        count={result.keywordSuggestions.length}
                        accentColor="bg-brand-500/15 text-brand-400"
                        defaultOpen
                    >
                        {result.keywordSuggestions.length === 0 ? (
                            <p className="text-slate-500 text-sm">Your resume already includes the key ATS terms!</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {result.keywordSuggestions.map((kw, i) => (
                                    <span key={i} className="text-xs bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1 rounded-full">{kw}</span>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Improved Bullets */}
                    <Section
                        icon={<ListChecks className="w-4 h-4" />}
                        title="Improved Resume Bullet Points"
                        count={result.improvedBullets.length}
                        accentColor="bg-emerald-500/15 text-emerald-400"
                        defaultOpen
                    >
                        {result.improvedBullets.length === 0 ? (
                            <p className="text-slate-500 text-sm">No bullet improvements suggested.</p>
                        ) : (
                            <div className="space-y-4 mt-1">
                                {result.improvedBullets.map((b, i) => (
                                    <div key={i} className="space-y-2">
                                        {b.original && b.original !== 'N/A' && (
                                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Before</span>
                                                <p className="text-slate-400 text-sm leading-relaxed mt-1">{b.original}</p>
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

                    {/* Analyze Again */}
                    <button
                        onClick={() => { setResult(null); setResumeFile(null); setJobDescription(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="btn-secondary w-full text-sm"
                    >
                        Start New Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
