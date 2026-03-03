import { StandaloneResumeOptimizer } from '@/components/StandaloneResumeOptimizer';

export const metadata = {
    title: 'AI Resume Optimizer — JobTrack',
    description: 'Upload your resume and get AI-powered suggestions tailored to any job description.',
};

export default function ResumeOptimizerPage() {
    return <StandaloneResumeOptimizer />;
}
