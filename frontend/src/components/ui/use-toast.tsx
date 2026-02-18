// src/components/ui/use-toast.tsx
import { useCallback } from 'react';
import { toast as hotToast } from 'react-hot-toast';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
    title?: string;
    description?: string;
    variant?: ToastVariant;
}

export function useToast() {
    const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
        const message = description ? (
            <div className="flex flex-col gap-1">
                {title && <span className="font-semibold text-sm">{title}</span>}
                <span className="text-sm opacity-90">{description}</span>
            </div>
        ) : (
            <span className="text-sm">{title}</span>
        );

        const options = {
            className: variant === 'destructive' ? '!bg-destructive !text-destructive-foreground' : '',
        };

        switch (variant) {
            case 'destructive':
                hotToast.error(message, options);
                break;
            case 'success':
                hotToast.success(message);
                break;
            default:
                hotToast(message);
                break;
        }
    }, []);

    return { toast };
}
