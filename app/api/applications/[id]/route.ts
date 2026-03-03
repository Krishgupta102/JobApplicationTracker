import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

interface Params {
    params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const existing = await prisma.application.findUnique({
            where: { id: params.id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const { companyName, role, status, interviewDate, notes } =
            await request.json();

        const updated = await prisma.application.update({
            where: { id: params.id },
            data: {
                ...(companyName && { companyName }),
                ...(role && { role }),
                ...(status && { status: status as ApplicationStatus }),
                interviewDate: interviewDate ? new Date(interviewDate) : null,
                notes: notes ?? null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const existing = await prisma.application.findUnique({
            where: { id: params.id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.application.delete({ where: { id: params.id } });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
