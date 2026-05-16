import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Run } from '@/types/run';

interface RunsContextType {
  runs: Run[];
  addRun: (run: Omit<Run, 'id'>) => Promise<void>;
  deleteRun: (id: string) => Promise<void>;
  isLoading: boolean;
}

const RunsContext = createContext<RunsContextType | null>(null);

const STORAGE_KEY = '@runstart_runs_v1';

export function RunsProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setRuns(JSON.parse(json));
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const persist = useCallback(async (updated: Run[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addRun = useCallback(
    async (runData: Omit<Run, 'id'>) => {
      const run: Run = {
        ...runData,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      };
      const updated = [run, ...runs].sort((a, b) => b.date.localeCompare(a.date));
      setRuns(updated);
      await persist(updated);
    },
    [runs, persist],
  );

  const deleteRun = useCallback(
    async (id: string) => {
      const updated = runs.filter((r) => r.id !== id);
      setRuns(updated);
      await persist(updated);
    },
    [runs, persist],
  );

  return (
    <RunsContext.Provider value={{ runs, addRun, deleteRun, isLoading }}>
      {children}
    </RunsContext.Provider>
  );
}

export function useRuns() {
  const ctx = useContext(RunsContext);
  if (!ctx) throw new Error('useRuns must be used within RunsProvider');
  return ctx;
}
