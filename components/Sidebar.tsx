'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/resume-optimizer', label: 'Resume Optimizer', icon: Sparkles },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">JobTrack</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === '/dashboard'
                        ? pathname === href
                        : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <p className="text-xs text-slate-600 text-center">JobTrack v1.0</p>
            </div>
        </aside>
    );
}
