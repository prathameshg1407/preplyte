// src/components/providers/MachineConfigProvider.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useMachineStore } from '@/lib/store/machine-store';
import { machineService } from '@/lib/api/services/machine.service';

// Global state to track initialization across all instances
let globalInitPromise: Promise<void> | null = null;
let globalInitAttempted = false;

async function loadConfigOnce(): Promise<void> {
  const store = useMachineStore.getState();
  
  // Check if already loaded
  if (store.configLoaded && store.languages.length > 0) {
    return;
  }

  // If already loading, wait
  if (globalInitPromise) {
    return globalInitPromise;
  }

  // If attempted and failed, don't retry immediately
  if (globalInitAttempted && store.configError) {
    return;
  }

  globalInitAttempted = true;
  store.setConfigLoading(true);
  store.setConfigError(null);

  globalInitPromise = (async () => {
    try {
      const [configResponse, languagesResponse, difficultyResponse] = await Promise.all([
        machineService.getConfig(),
        machineService.getLanguages(),
        machineService.getDifficultyLevels(),
      ]);

      const currentStore = useMachineStore.getState();

      if (configResponse.success && configResponse.data) {
        currentStore.setConfig(configResponse.data);
      }

      if (languagesResponse.success && languagesResponse.data) {
        currentStore.setLanguages(languagesResponse.data.languages);
      }

      if (difficultyResponse.success && difficultyResponse.data) {
        currentStore.setDifficultyLevels(difficultyResponse.data.difficultyLevels);
      }

      currentStore.setConfigLoaded(true);
      currentStore.setConfigLoading(false);
    } catch (error) {
      console.error('Failed to load machine config:', error);
      const currentStore = useMachineStore.getState();
      currentStore.setConfigError('Failed to load configuration. Please refresh.');
      currentStore.setConfigLoading(false);
      
      // Allow retry after 10 seconds
      setTimeout(() => {
        globalInitAttempted = false;
        globalInitPromise = null;
      }, 10000);
      
      throw error;
    }
  })();

  return globalInitPromise;
}

interface MachineConfigProviderProps {
  children: React.ReactNode;
}

export function MachineConfigProvider({ children }: MachineConfigProviderProps) {
  const hasHydrated = useMachineStore((state) => state._hasHydrated);
  const configLoaded = useMachineStore((state) => state.configLoaded);
  const initRef = useRef(false);

  useEffect(() => {
    // Wait for hydration
    if (!hasHydrated) {
      return;
    }

    // Skip if already loaded or already attempted init
    if (configLoaded || initRef.current) {
      return;
    }

    initRef.current = true;
    loadConfigOnce().catch(() => {
      // Error already handled
      initRef.current = false; // Allow retry
    });
  }, [hasHydrated, configLoaded]);

  return <>{children}</>;
}

// Export for manual initialization
export { loadConfigOnce };