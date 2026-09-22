import { inject, Service, signal, WritableSignal } from '@angular/core';
import { TrainingService } from '../services/supabase/training.service';

export interface Workout {
  programId: number;
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: number;
  name: string;
  repsRange: string | null;
  sets: WorkoutExerciseSet[];
  bestSet: {
    reps: number;
    weight: number;
  } | null;
  restTimeSeconds: number;
  notes?: string;
  completed: WritableSignal<boolean>;
}

export interface WorkoutExerciseSet {
  position: number;
  reps: number;
  weight: number;
}

@Service()
export class LogState {
  private readonly supabase = inject(TrainingService);

  readonly workout = signal<Workout | null>(null);

  async beginWorkout(programId: number) {
    const previous = await this.supabase.createProgramWorkout(programId);
    this.workout.set({
      programId: previous?.program.id,
      name: previous?.program.name,
      exercises:
        previous?.exercises.map(
          (e) =>
            ({
              id: e.id,
              name: e.name,
              repsRange: e.repsRange,
              restTimeSeconds: e.restTimeSeconds,
              notes: e.notes,
              completed: signal(false),
              bestSet: e.bestSet,
              sets: e.sets.map(
                (s, i) =>
                  ({
                    position: i,
                    reps: s.reps,
                    weight: s.weight,
                  }) as WorkoutExerciseSet,
              ),
            }) as WorkoutExercise,
        ) ?? [],
    } as Workout);
  }

  endWorkout() {
    this.workout.set(null);
  }
}
