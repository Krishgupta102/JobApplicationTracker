import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Basic in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5; // max analyses per hour per application
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        rateLimitMap.set(key, { count: 1, windowStart: now });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
        where: { id: params.id },
    });

    if (!application || application.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
        where: { applicationId: params.id },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(analyses);
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ownership check
    const application = await prisma.application.findUnique({
        where: { id: params.id },
    });

    if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limit
    const rateLimitKey = `${session.user.id}:${params.id}`;
    if (!checkRateLimit(rateLimitKey)) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Max 5 analyses per hour per application.' },
            { status: 429 }
        );
    }

    let jobDescription: string, resumeContent: string;
    try {
        const body = await request.json();
        jobDescription = body.jobDescription?.trim();
        resumeContent = body.resumeContent?.trim();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!jobDescription || !resumeContent) {
        return NextResponse.json(
            { error: 'jobDescription and resumeContent are required' },
            { status: 400 }
        );
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        return NextResponse.json(
            { error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' },
            { status: 503 }
        );
    }

    // Build prompt
    const prompt = `You are an expert resume coach and ATS optimization specialist. Analyze the following resume against the job description and return a structured JSON response.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeContent}

Respond ONLY with valid JSON (no markdown, no code fences) in this exact structure:
{
  "score": <integer 0-100 representing overall resume-to-job match>,
  "missingSkills": [<array of missing skills/technologies as strings>],
  "keywordSuggestions": [<array of ATS keywords from the job description that should be added to resume as strings>],
  "improvedBullets": [
    {
      "original": "<original bullet point from resume or 'N/A'>",
      "improved": "<rewritten, quantified, impactful version>"
    }
  ],
  "feedbackSummary": "<2-4 sentence overall assessment with key recommendations>"
}

Base the score on: skills match, keyword density, experience relevance, and overall alignment. Be honest and constructive.`;

    let aiResponse: {
        score: number;
        missingSkills: string[];
        keywordSuggestions: string[];
        improvedBullets: { original: string; improved: string }[];
        feedbackSummary: string;
    };

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Strip any stray markdown fences just in case
        const cleaned = text.replace(/```json|```/g, '').trim();
        aiResponse = JSON.parse(cleaned);

        // Validate required fields
        if (
            typeof aiResponse.score !== 'number' ||
            !Array.isArray(aiResponse.missingSkills) ||
            !Array.isArray(aiResponse.keywordSuggestions) ||
            !Array.isArray(aiResponse.improvedBullets) ||
            typeof aiResponse.feedbackSummary !== 'string'
        ) {
            throw new Error('Invalid AI response structure');
        }

        // Clamp score
        aiResponse.score = Math.min(100, Math.max(0, Math.round(aiResponse.score)));
    } catch (err: any) {
        console.error('AI analysis error:', err);
        // Gemini quota/rate limit
        if (err?.status === 429) {
            return NextResponse.json(
                { error: 'Gemini API rate limit reached. Please wait a minute and try again.' },
                { status: 429 }
            );
        }
        // Gemini model not found
        if (err?.status === 404) {
            return NextResponse.json(
                { error: 'AI model configuration error. Please contact support.' },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'AI analysis failed. Please try again.' },
            { status: 500 }
        );
    }

    // Save to DB
    const analysis = await prisma.resumeAnalysis.create({
        data: {
            applicationId: params.id,
            jobDescription,
            resumeContent,
            aiResponse,
            score: aiResponse.score,
        },
    });

    return NextResponse.json(analysis, { status: 201 });
}
