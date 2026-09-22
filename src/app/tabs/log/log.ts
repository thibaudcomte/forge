import { Component, computed, effect, inject, input, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
import {
  arrowForwardCircleOutline,
  arrowForwardOutline,
  caretForwardCircleOutline,
  checkmarkCircleOutline,
  listCircleOutline,
} from 'ionicons/icons';
import { TrainingService } from '../../services/supabase/training.service';
import { LogState } from '../../state/log-state';
import { ExerciseComponent } from './exercise/exercise';

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
    addIcons({
      arrowForwardOutline,
      arrowForwardCircleOutline,
      caretForwardCircleOutline,
      listCircleOutline,
      checkmarkCircleOutline,
    });
    effect(() => this.state.beginWorkout(this.programId()));
  }

  private readonly supabase = inject(TrainingService);
  private readonly state = inject(LogState);
  private readonly router = inject(Router);

  readonly programId = input.required<number>();
  readonly workout = computed(() => this.state.workout());

  readonly currentExerciseId = signal(0);
  readonly completedExerciseIds = signal<ReadonlySet<number>>(new Set());
  readonly currentExercise = computed(() => {
    const exercises = this.state.workout()?.exercises ?? [];
    return exercises.find((exercise) => exercise.id === this.currentExerciseId()) ?? exercises?.[0];
  });
  readonly hasRemainingExercise = computed(() =>
    this.state.workout()?.exercises.some((exercise) => !this.completedExerciseIds().has(exercise.id)),
  );

  @ViewChild(IonContent, { static: true }) content!: IonContent;

  isCurrentExerciseComplete() {
    const exercise = this.currentExercise();
    return exercise?.completed() ?? false;
  }

  nextExercise() {
    if (!this.hasRemainingExercise() || !this.isCurrentExerciseComplete()) return;

    const currentExercise = this.currentExercise();
    if (!currentExercise) return;
    this.completedExerciseIds.update((completedIds) => new Set(completedIds).add(currentExercise.id));

    const remaining = this.state.workout()?.exercises.find((exercise) => !this.completedExerciseIds().has(exercise.id));
    if (remaining) this.currentExerciseId.set(remaining.id);
  }

  exercisesActionSheetButtons = computed<ActionSheetButton<ExerciseData>[]>(() => {
    const getIcon = (exerciseId: number) => {
      if (this.completedExerciseIds().has(exerciseId)) return 'checkmark-circle-outline';
      if (this.currentExercise()?.id === exerciseId) return 'arrow-forward-outline';
      return 'caret-forward-circle-outline';
    };

    const getCssClass = (exerciseId: number) => {
      if (this.completedExerciseIds().has(exerciseId)) return 'completed-exercise';
      if (this.currentExercise()?.id === exerciseId) return 'current-exercise';
      return '';
    };

    if (!this.state.workout()) return [];

    return this.state.workout()!.exercises.map(
      (e) =>
        ({
          text: e.name,
          data: { id: e.id },
          icon: getIcon(e.id),
          cssClass: getCssClass(e.id),
        }) as ActionSheetButton<ExerciseData>,
    );
  });

  async onPickExerciseDone(event: CustomEvent<OverlayEventDetail<ExerciseData>>) {
    event.preventDefault();
    const exerciseId = event.detail.data?.id;
    if (!exerciseId) return;
    this.currentExerciseId.set(exerciseId);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await this.content.scrollToTop(100);
  }

  async save() {
    const workout = this.state.workout();
    if (!workout?.programId) return;

    await this.supabase.saveWorkout(workout.programId, workout.exercises);
    this.state.endWorkout();

    const toast = await this.toastController.create({
      message: 'Workout was saved successfully!',
      duration: 2_000,
      position: 'bottom',
    });

    await toast.present();

    this.router.navigate(['/tabs/home']);
  }
}
