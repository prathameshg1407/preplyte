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

    const handleViolation = useCallback((type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE' | 'RIGHT_CLICK') => {
        const currentSettings = settingsRef.current;
        if (!currentSettings || !isAttemptActiveRef.current) return;

        setViolationCount((prev) => prev + 1);

        const maxWarnings = currentSettings.maxTabSwitches ?? currentSettings.maxWarnings ?? 0;
        const currentWarnings = warningsRef.current;

        if (currentWarnings >= maxWarnings) {
            if (currentSettings.autoSubmitOnViolation) {
                toast.error('Proctoring violation detected. Submitting attempt immediately...');
                onViolationLimitExceededRef.current();
            } else {
                toast.error('Proctoring violation detected. Please stay within the test environment.');
            }
        } else {
            setWarnings((prev) => prev + 1);
            const remaining = maxWarnings - currentWarnings;

            const messages = {
                TAB_SWITCH: 'Tab switching detected',
                FULLSCREEN_EXIT: 'Fullscreen exited',
                COPY_PASTE: 'Copy/Paste/Cut action detected',
                RIGHT_CLICK: 'Right click action detected',
            };

            toast.warning(`${messages[type]}! Warning ${currentWarnings + 1}/${maxWarnings + 1}.`);
        }
    }, []);

    const enterFullscreen = useCallback(async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
            // Don't show toast error here as it might triggered by browser before user interaction
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

        const handleWindowBlur = () => {
            // More aggressive than visibilitychange
            if (isAttemptActiveRef.current) {
                handleViolation('TAB_SWITCH');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [settings?.detectTabSwitch, isAttemptActive, handleViolation]);

    // Copy/Paste Restriction
    useEffect(() => {
        if (!settings?.detectCopyPaste || !isAttemptActive) return;

        const preventCopyPaste = (e: Event) => {
            e.preventDefault();
            handleViolation('COPY_PASTE');
            return false;
        };

        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);

        return () => {
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
        };
    }, [settings?.detectCopyPaste, isAttemptActive, handleViolation]);

    // Right Click Restriction
    useEffect(() => {
        if (!settings?.rightClickDisabled || !isAttemptActive) return;

        const preventRightClick = (e: MouseEvent) => {
            e.preventDefault();
            handleViolation('RIGHT_CLICK');
            return false;
        };

        document.addEventListener('contextmenu', preventRightClick);

        return () => {
            document.removeEventListener('contextmenu', preventRightClick);
        };
    }, [settings?.rightClickDisabled, isAttemptActive, handleViolation]);

    // Text Selection Restriction
    useEffect(() => {
        if (!settings?.textSelectionDisabled || !isAttemptActive) return;

        const preventSelection = (e: Event) => {
            e.preventDefault();
            return false;
        };

        const preventCopy = (e: Event) => {
            e.preventDefault();
            handleViolation('COPY_PASTE');
            return false;
        };

        document.addEventListener('selectstart', preventSelection);
        document.addEventListener('dragstart', preventSelection);
        document.addEventListener('copy', preventCopy);
        
        // Add CSS to disable selection
        const style = document.createElement('style');
        style.id = 'disable-selection';
        style.innerHTML = `
            body {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('selectstart', preventSelection);
            document.removeEventListener('dragstart', preventSelection);
            document.removeEventListener('copy', preventCopy);
            document.getElementById('disable-selection')?.remove();
        };
    }, [settings?.textSelectionDisabled, isAttemptActive, handleViolation]);

    return {
        isProctoringActive: !!settings?.enableProctoring,
        isFullscreen: settings?.requireFullscreen ? isFullscreen : true,
        warnings,
        enterFullscreen,
        violationCount
    };
};
