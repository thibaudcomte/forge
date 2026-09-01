import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import type { OverlayEventDetail } from '@ionic/core';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, checkmarkCircleOutline, listCircleOutline } from 'ionicons/icons';
import { from, switchMap } from 'rxjs';
import { TrainingService } from '../../services/supabase/training.service';
import { LogState } from '../../state/log-state';
import { ExerciseComponent } from './exercise/exercise';

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
  completed: boolean;
}

export interface WorkoutExerciseSet {
  position: number;
  reps: number;
  weight: number;
}

interface ExerciseData {
  id: number;
}

@Component({
  selector: 'log',
  imports: [
    IonActionSheet,
    IonIcon,
    IonButton,
    IonText,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    ExerciseComponent,
  ],
  templateUrl: './log.html',
})
export class LogPage {
  constructor(private toastController: ToastController) {
    addIcons({ arrowForwardOutline, listCircleOutline, checkmarkCircleOutline });
    effect(() => this.state.beginWorkout(this.programId()));
  }

  private readonly supabase = inject(TrainingService);
  private readonly state = inject(LogState);

  readonly programId = input.required<number>();

  readonly previousWorkout = toSignal(
    toObservable(this.programId).pipe(switchMap((programId) => from(this.supabase.createProgramWorkout(programId)))),
    { initialValue: undefined },
  );
  readonly workout = computed(() => {
    const previous = this.previousWorkout();
    const result = {
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
              completed: false,
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
    } as Workout;
    return result;
  });
  readonly currentExerciseId = signal(0);
  readonly completedExerciseIds = signal<ReadonlySet<number>>(new Set());
  readonly currentExercise = computed(() => {
    const exercises = this.workout().exercises;
    return exercises.find((exercise) => exercise.id === this.currentExerciseId()) ?? exercises[0];
  });
  readonly hasRemainingExercise = computed(() =>
    this.workout().exercises.some((exercise) => !this.completedExerciseIds().has(exercise.id)),
  );

  isCurrentExerciseComplete() {
    const exercise = this.currentExercise();
    return exercise?.completed;
  }

  nextExercise() {
    if (!this.hasRemainingExercise() || !this.isCurrentExerciseComplete()) return;

    const currentExercise = this.currentExercise();
    if (!currentExercise) return;
    this.completedExerciseIds.update((completedIds) => new Set(completedIds).add(currentExercise.id));

    const remaining = this.workout().exercises.find((exercise) => !this.completedExerciseIds().has(exercise.id));
    if (remaining) this.currentExerciseId.set(remaining.id);
  }

  exercisesActionSheetButtons = computed<ActionSheetButton<ExerciseData>[]>(() =>
    this.workout()
      .exercises.filter((e) => !this.completedExerciseIds().has(e.id))
      .filter((e) => e !== this.currentExercise())
      .map(
        (e) =>
          ({
            text: e.name,
            data: { id: e.id },
          }) as ActionSheetButton<ExerciseData>,
      ),
  );

  onPickExerciseDone(event: CustomEvent<OverlayEventDetail<ExerciseData>>) {
    event.preventDefault();
    const exerciseId = event.detail.data?.id;
    if (!exerciseId) return;
    this.currentExerciseId.set(exerciseId);
  }

  async save() {
    const workout = this.workout();
    if (!workout.programId) return;

    await this.supabase.saveWorkout(workout.programId, workout.exercises);
    this.state.endWorkout();

    const toast = await this.toastController.create({
      message: 'Workout was saved successfully!',
      duration: 3_000,
      position: 'bottom',
    });

    await toast.present();
  }
}
