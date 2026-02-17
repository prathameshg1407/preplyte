'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToFinalTest() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        router.replace(`/admin/lms/courses/${params.courseId}/final-test`);
    }, [params, router]);

    return null;
}
