import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { stopwatchOutline, timeOutline } from 'ionicons/icons';
import { SecondsPipe } from '../../../pipes/seconds-pipe';
import { WorkoutExercise } from '../log';
import { ExerciseSetComponent } from './set/exercise-set';

// interface CountdownPlugin {
//   start(options: { seconds: number }): Promise<void>;
//   stop(): Promise<void>;
// }

@Component({
  selector: 'exercise',
  imports: [
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    ExerciseSetComponent,
    IonIcon,
    IonText,
    IonButton,
    SecondsPipe,
    IonTextarea,
  ],
  templateUrl: './exercise.html',
})
export class ExerciseComponent {
  readonly exercise = input.required<WorkoutExercise>();
  // private readonly countdown = registerPlugin<CountdownPlugin>('Countdown');

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

  startRestTimer(): void {
    if (!this.canStartRestTimer()) return;
    // void this.countdown.start({ seconds: 90 });
    this.exercise().completed = true;
    this.currentSetIndex.update((idx) => Math.min(this.exercise().sets.length - 1, idx + 1));
  }
}
