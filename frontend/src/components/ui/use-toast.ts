// src/components/ui/use-toast.ts

import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    // For now, just use console or browser alert
    // Replace with proper toast implementation later
    if (variant === 'destructive') {
      console.error(`${title}: ${description}`);
    } else {
      console.log(`${title}: ${description}`);
    }
    
    // Or use browser notification
    // alert(`${title}\n${description}`);
  }, []);

  return { toast };
}

export { useToast as toast };