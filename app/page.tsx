import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, TrendingUp, Shield, Zap } from 'lucide-react';

export default async function HomePage() {
    const session = await auth();
    if (session) redirect('/dashboard');

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col">
            {/* Nav */}
            <nav className="border-b border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-brand-400" />
                        <span className="text-xl font-bold text-white">JobTrack</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="btn-primary text-sm"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
                <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                    <Zap className="w-4 h-4" />
                    Free to use · No credit card required
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                    Track every job application{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                        effortlessly
                    </span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                    JobTrack keeps all your job applications organized in one beautiful
                    dashboard. Never lose track of an opportunity again.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/signup" className="btn-primary text-base px-8 py-3">
                        Start Tracking for Free
                    </Link>
                    <Link href="/login" className="btn-secondary text-base px-8 py-3">
                        Sign In
                    </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
                    {[
                        {
                            icon: TrendingUp,
                            title: 'Analytics Dashboard',
                            desc: 'Visualize your job search with charts and stats at a glance.',
                        },
                        {
                            icon: Shield,
                            title: 'Private & Secure',
                            desc: 'Your data is encrypted and only visible to you. Always.',
                        },
                        {
                            icon: Briefcase,
                            title: 'Full CRUD Control',
                            desc: 'Add, edit, filter, and delete applications with ease.',
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="glass-card p-6 text-left">
                            <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center mb-4">
                                <Icon className="w-5 h-5 text-brand-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-slate-800 px-6 py-6 text-center text-slate-600 text-sm">
                © {new Date().getFullYear()} JobTrack. Built with Next.js &amp; ♥
            </footer>
        </main>
    );
}
