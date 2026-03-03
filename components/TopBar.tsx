'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

interface TopBarProps {
    userEmail: string;
}

export function TopBar({ userEmail }: TopBarProps) {
    return (
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="text-sm text-slate-400">
                <span className="text-slate-500">Welcome,</span>{' '}
                <span className="text-slate-200 font-medium">{userEmail}</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 max-w-[120px] truncate">
                        {userEmail}
                    </span>
                </div>
                <button
                    id="logout-btn"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </header>
    );
}
