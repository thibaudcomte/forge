import { Service } from '@angular/core';
import { supabase } from './client';

export interface ProgramLight {
  id: number;
  name: string;
  description: string;
  exercisesCount: number;
  lastPerformedAt: Date | null;
  //nextScheduledDate: Date;
}

export interface Workout {
  program: {
    id: number;
    name: string;
    description: string;
    lastPerformedAt: Date | null;
  };
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: number;
  name: string;
  repsRange: string;
  sets: {
    reps: number;
    weight: number;
  }[];
  bestSet: {
    reps: number;
    weight: number;
  } | null;
  restTimeSeconds: number;
}

@Service()
export class SupabaseService {
  async getProgramsLight() {
    const { data, error } = await supabase
      .from('programs')
      .select(
        `
        id, 
        name, 
        description,
        program_exercises (count),
        workouts (performed_at)
        `,
      )
      .order('performed_at', { referencedTable: 'workouts', ascending: false })
      .limit(1, { referencedTable: 'workouts' });

    if (error) {
      console.error('Error fetching programs:', error);
      throw new Error(error.message);
    }

    return data.map((p) => {
      const performedAt = p.workouts[0]?.performed_at;
      return {
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        exercisesCount: p.program_exercises[0]?.count ?? 0,
        lastPerformedAt: performedAt ? new Date(performedAt) : null,
      } as ProgramLight;
    });
  }

  async createProgramWorkout(programId: number) {
    const { data, error } = await supabase
      .from('programs')
      .select(
        `
        id,
        name,
        description,
        program_exercises (
          position,
          sets_count,
          reps_range,
          exercise_id,
          exercises (id, name, rest_time_seconds)
        ),
        workouts (
          id,
          performed_at,
          workout_exercises (
            exercise_id,
            exercise_sets (set_index, reps, weight)
          )
        )`,
      )
      .eq('id', programId)
      .order('performed_at', { referencedTable: 'workouts', ascending: false })
      .single();

    if (error) {
      console.error('Error fetching program workout:', error);
      throw new Error(error.message);
    }

    const latestWorkout = data.workouts[0];
    const workoutExercises = latestWorkout?.workout_exercises ?? [];
    const historicalWorkoutExercises = data.workouts.flatMap((workout) => workout.workout_exercises);

    return {
      program: {
        id: data.id,
        name: data.name,
        description: data.description ?? '',
        lastPerformedAt: latestWorkout?.performed_at ? new Date(latestWorkout.performed_at) : null,
      },
      exercises: data.program_exercises
        .sort((a, b) => a.position - b.position)
        .map((programExercise) => {
          const workoutExercise = workoutExercises.find(
            (exercise) => exercise.exercise_id === programExercise.exercise_id,
          );
          const bestSet = historicalWorkoutExercises
            .filter((exercise) => exercise.exercise_id === programExercise.exercise_id)
            .flatMap((exercise) => exercise.exercise_sets)
            .filter((set) => set.reps !== null && set.weight !== null)
            .reduce<{ reps: number; weight: number } | null>((best, set) => {
              const candidate = { reps: set.reps!, weight: set.weight! };
              return !best || candidate.reps * candidate.weight > best.reps * best.weight ? candidate : best;
            }, null);
          const sets = workoutExercise?.exercise_sets.length
            ? workoutExercise.exercise_sets
                .sort((a, b) => a.set_index - b.set_index)
                .map((set) => ({ reps: set.reps ?? 0, weight: set.weight ?? 0 }))
            : Array.from({ length: programExercise.sets_count }, () => ({
                reps: 0,
                weight: 0,
              }));

          return {
            id: programExercise.exercise_id,
            name: programExercise.exercises.name,
            repsRange: programExercise.reps_range,
            sets,
            bestSet,
            restTimeSeconds: programExercise.exercises.rest_time_seconds,
          };
        }),
    } satisfies Workout;
  }

  async saveWorkout(
    programId: number,
    exercises: {
      id: number;
      sets: { position: number; reps: number; weight: number }[];
    }[],
  ) {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({ program_id: programId, performed_at: new Date().toISOString() })
      .select('id')
      .single();

    if (workoutError) {
      console.error('Error saving workout:', workoutError);
      throw new Error(workoutError.message);
    }

    const { data: workoutExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(
        exercises.map((exercise, position) => ({
          workout_id: workout.id,
          exercise_id: exercise.id,
          position,
        })),
      )
      .select('id');

    if (exercisesError) {
      console.error('Error saving workout exercises:', exercisesError);
      throw new Error(exercisesError.message);
    }

    const sets = exercises.flatMap((exercise, exerciseIndex) =>
      exercise.sets.map((set) => ({
        workout_exercise_id: workoutExercises[exerciseIndex].id,
        set_index: set.position,
        reps: set.reps,
        weight: set.weight,
      })),
    );

    if (sets.length === 0) return workout.id;

    const { error: setsError } = await supabase.from('exercise_sets').insert(sets);
    if (setsError) {
      console.error('Error saving exercise sets:', setsError);
      throw new Error(setsError.message);
    }

    return workout.id;
  }
}
