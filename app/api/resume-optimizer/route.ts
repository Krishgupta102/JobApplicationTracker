import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const WINDOW_MS = 60 * 60 * 1000;
    const RATE_LIMIT = 10;
    const entry = rateLimitMap.get(key);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        rateLimitMap.set(key, { count: 1, windowStart: now });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf')) {
        // Import the internal lib directly — avoids pdf-parse/index.js which tries to
        // read test files from disk (module.parent check) and crashes in Next.js
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse/lib/pdf-parse.js');
        const data = await pdfParse(buffer);
        return data.text ?? '';
    }

    if (name.endsWith('.docx') || name.endsWith('.doc')) {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    // Plain text / fallback
    return buffer.toString('utf-8');
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        return NextResponse.json(
            { error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' },
            { status: 503 }
        );
    }

    if (!checkRateLimit(session.user.id)) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Max 10 analyses per hour.' },
            { status: 429 }
        );
    }

    let jobDescription: string;
    let resumeText: string;

    try {
        const formData = await request.formData();
        const resumeFile = formData.get('resume') as File | null;
        const jd = formData.get('jobDescription') as string | null;

        if (!jd?.trim()) {
            return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
        }
        jobDescription = jd.trim();

        if (!resumeFile || resumeFile.size === 0) {
            return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (resumeFile.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Resume file must be under 5MB.' }, { status: 400 });
        }

        resumeText = await extractTextFromFile(resumeFile);

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Could not extract enough text from the resume. Please ensure it is not a scanned image.' },
                { status: 400 }
            );
        }
    } catch (err: any) {
        console.error('File parse error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to read the resume file.' },
            { status: 400 }
        );
    }

    const prompt = `You are an expert resume coach and ATS optimization specialist. Analyze the following resume against the job description and return a structured JSON response.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeText}

Respond ONLY with valid JSON (no markdown, no code fences) in this exact structure:
{
  "score": <integer 0-100 representing overall resume-to-job match>,
  "missingSkills": [<array of missing skills/technologies as strings>],
  "keywordSuggestions": [<array of ATS keywords from the job description that should be added to resume as strings>],
  "improvedBullets": [
    {
      "original": "<original bullet point from resume>",
      "improved": "<rewritten, quantified, impactful version>"
    }
  ],
  "feedbackSummary": "<2-4 sentence overall assessment with key recommendations>"
}

Base the score on: skills match, keyword density, experience relevance, and overall alignment. Be honest and constructive. Provide at least 3 improved bullet points.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const aiResponse = JSON.parse(cleaned);

        // Validate
        if (
            typeof aiResponse.score !== 'number' ||
            !Array.isArray(aiResponse.missingSkills) ||
            !Array.isArray(aiResponse.keywordSuggestions) ||
            !Array.isArray(aiResponse.improvedBullets) ||
            typeof aiResponse.feedbackSummary !== 'string'
        ) {
            throw new Error('Invalid AI response structure');
        }

        aiResponse.score = Math.min(100, Math.max(0, Math.round(aiResponse.score)));

        return NextResponse.json({
            score: aiResponse.score,
            missingSkills: aiResponse.missingSkills,
            keywordSuggestions: aiResponse.keywordSuggestions,
            improvedBullets: aiResponse.improvedBullets,
            feedbackSummary: aiResponse.feedbackSummary,
            extractedResumeLength: resumeText.length,
        });
    } catch (err: any) {
        console.error('AI analysis error:', err);
        if (err?.status === 429) {
            return NextResponse.json(
                { error: 'Gemini rate limit reached. Please wait a minute and try again.' },
                { status: 429 }
            );
        }
        return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 });
    }
}
