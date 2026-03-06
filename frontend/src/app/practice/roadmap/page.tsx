// src/app/practice/roadmap/page.tsx
// This redirects to the main LMS roadmap page
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeRoadmapPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/lms/roadmap');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
            Redirecting to roadmap...
        </div>
    );
}
