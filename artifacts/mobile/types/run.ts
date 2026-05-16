export type RunType = 'Easy' | 'Tempo' | 'Long';

export interface Run {
  id: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  runType: RunType;
  notes?: string;
}
