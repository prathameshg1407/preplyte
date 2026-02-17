import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ProctoringSettings } from '@/types/mockdrive.types';

interface UseProctoringProps {
    settings: ProctoringSettings | null;
    onViolationLimitExceeded: () => void;
    isAttemptActive: boolean;
}

interface UseProctoringReturn {
    isProctoringActive: boolean;
    isFullscreen: boolean;
    warnings: number;
    enterFullscreen: () => Promise<void>;
    violationCount: number;
}

export const useProctoring = ({
    settings,
    onViolationLimitExceeded,
    isAttemptActive,
}: UseProctoringProps): UseProctoringReturn => {
    const [isFullscreen, setIsFullscreen] = useState(true); // Default to true to avoid flash, checked in effect
    const [warnings, setWarnings] = useState(0);
    const [violationCount, setViolationCount] = useState(0);

    // Refs to avoid dependency cycles in event listeners
    const settingsRef = useRef(settings);
    const warningsRef = useRef(warnings);
    const onViolationLimitExceededRef = useRef(onViolationLimitExceeded);
    const isAttemptActiveRef = useRef(isAttemptActive);

    useEffect(() => {
        settingsRef.current = settings;
        warningsRef.current = warnings;
        onViolationLimitExceededRef.current = onViolationLimitExceeded;
        isAttemptActiveRef.current = isAttemptActive;
    }, [settings, warnings, onViolationLimitExceeded, isAttemptActive]);

    const handleViolation = useCallback((type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT') => {
        const currentSettings = settingsRef.current;
        if (!currentSettings || !isAttemptActiveRef.current) return;

        setViolationCount((prev) => prev + 1);

        const maxWarnings = currentSettings.maxWarnings ?? 3;
        const currentWarnings = warningsRef.current;

        if (currentWarnings >= maxWarnings) {
            if (currentSettings.autoSubmitOnViolation) {
                toast.error('Maximum proctoring violations exceeded. Submitting attempt...');
                onViolationLimitExceededRef.current();
            } else {
                toast.error('Maximum proctoring violations exceeded. Please contact the administrator.');
            }
        } else {
            setWarnings((prev) => prev + 1);
            const remaining = maxWarnings - currentWarnings - 1;

            if (type === 'TAB_SWITCH') {
                toast.warning(`Tab switching detected! Warning ${currentWarnings + 1}/${maxWarnings}.`);
            } else if (type === 'FULLSCREEN_EXIT') {
                toast.warning(`Fullscreen exited! Warning ${currentWarnings + 1}/${maxWarnings}.`);
            }
        }
    }, []);

    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
            toast.error('Could not enter fullscreen mode. Please try again.');
        }
    }, []);

    // Monitor Fullscreen
    useEffect(() => {
        if (!settings?.requireFullscreen || !isAttemptActive) return;

        const handleFullscreenChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFullscreen(isFs);
            if (!isFs && isAttemptActiveRef.current) {
                handleViolation('FULLSCREEN_EXIT');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Initial check
        if (!document.fullscreenElement) {
            setIsFullscreen(false);
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [settings?.requireFullscreen, isAttemptActive, handleViolation]);

    // Monitor Tab Switching (Visibility)
    useEffect(() => {
        if (!settings?.detectTabSwitch || !isAttemptActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden && isAttemptActiveRef.current) {
                handleViolation('TAB_SWITCH');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [settings?.detectTabSwitch, isAttemptActive, handleViolation]);

    // Monitor Window Focus (Blur) implementation if needed
    // Note: 'blur' can be too aggressive (e.g. clicking an alert), so often visibilitychange is preferred.
    // We will stick to visibilitychange for 'detectTabSwitch' as per standard practices.

    return {
        isProctoringActive: !!settings?.enableProctoring,
        isFullscreen: settings?.requireFullscreen ? isFullscreen : true, // If not required, always consider it "valid"
        warnings,
        enterFullscreen,
        violationCount
    };
};
