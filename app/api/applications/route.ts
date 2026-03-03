import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || '';

    const applications = await prisma.application.findMany({
        where: {
            userId: session.user.id,
            ...(statusParam && statusParam !== 'All'
                ? { status: statusParam as ApplicationStatus }
                : {}),
            ...(search
                ? { companyName: { contains: search, mode: 'insensitive' } }
                : {}),
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { companyName, role, status, interviewDate, notes } =
            await request.json();

        if (!companyName || !role || !status) {
            return NextResponse.json(
                { error: 'Company name, role, and status are required' },
                { status: 400 }
            );
        }

        const application = await prisma.application.create({
            data: {
                companyName,
                role,
                status: status as ApplicationStatus,
                interviewDate: interviewDate ? new Date(interviewDate) : null,
                notes: notes || null,
                userId: session.user.id,
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Create application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
