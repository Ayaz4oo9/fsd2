import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

import {
  performanceMonitor,
} from './performanceMonitor';

const PerformanceContext =
  createContext(null);

export function PerformanceProvider({
  children,
}) {
  const snapshot =
    useSyncExternalStore(
      performanceMonitor.subscribe,
      performanceMonitor.getSnapshot,
      performanceMonitor.getSnapshot
    );

  const value = useMemo(
    () => ({
      ...snapshot,

      optimized:
        snapshot.mode ===
        'optimized',

      setMode:
        performanceMonitor.setMode,

      beginInteraction:
        performanceMonitor.beginInteraction,

      finishInteraction:
        performanceMonitor.finishInteraction,
    }),
    [snapshot]
  );

  return (
    <PerformanceContext.Provider
      value={value}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context =
    useContext(
      PerformanceContext
    );

  if (!context) {
    throw new Error(
      'usePerformance must be used inside PerformanceProvider'
    );
  }

  return context;
}