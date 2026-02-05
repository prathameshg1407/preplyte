'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToTest() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        router.replace(`/admin/lms/courses/${params.courseId}/modules/${params.moduleId}/test`);
    }, [params, router]);

    return null;
}
