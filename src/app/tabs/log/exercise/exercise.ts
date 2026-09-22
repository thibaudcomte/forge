import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPopover,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { stopwatchOutline, timeOutline } from 'ionicons/icons';
import { WorkoutExercise } from '../../../state/log-state';
import { RestButton } from './rest-button';
import { ExerciseSetComponent } from './set/exercise-set';

@Component({
  selector: 'exercise',
  imports: [
    IonContent,
    IonButton,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    ExerciseSetComponent,
    IonIcon,
    IonText,
    IonTextarea,
    RestButton,
    IonPopover,
  ],
  templateUrl: './exercise.html',
})
export class ExerciseComponent {
  readonly exercise = input.required<WorkoutExercise>();

  constructor() {
    addIcons({ timeOutline, stopwatchOutline });
    effect(() => {
      this.exercise();
      this.currentSetIndex.set(0);
    });
  }

  currentSetIndex = signal(0);

  canStartRestTimer() {
    const set = this.exercise().sets.at(this.currentSetIndex());
    return set?.reps && set?.reps > 0 && set?.weight && set?.weight > 0;
  }

  async onTimerChanged(event: 'start' | 'stop') {
    if (event === 'start') {
      if (!this.canStartRestTimer()) return;

      LocalNotifications.cancel({ notifications: [{ id: 1 }] });

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Time to Resume Your Workout',
            body: 'Your rest time is over.',
            schedule: { at: new Date(Date.now() + this.exercise().restTimeSeconds * 1000) },
          },
        ],
      });
    }

    if (event === 'stop') {
      await Haptics.vibrate({ duration: 1_000 });
      this.currentSetIndex.update((idx) => idx + 1);
      if (this.currentSetIndex() === this.exercise().sets.length) {
        this.exercise().completed.set(true);
      }
    }
  }
}
