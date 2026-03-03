import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { auth } from '@/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'JobTrack — Job Application Tracker',
    description:
        'Track your job applications, interviews, and offers all in one place.',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-slate-950 text-slate-100 antialiased">
                <SessionProvider session={session}>{children}</SessionProvider>
            </body>
        </html>
    );
}
