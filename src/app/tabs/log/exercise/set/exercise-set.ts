import { Component, effect, input } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import { WorkoutExerciseSet } from '../../../../state/log-state';

@Component({
  selector: 'exercise-set',
  imports: [IonInput],
  templateUrl: './exercise-set.html',
  styleUrl: './exercise-set.css',
})
export class ExerciseSetComponent {
  readonly set = input.required<WorkoutExerciseSet>();
  readonly hasHeader = input(false);

  constructor() {
    effect(() => {
      const set = this.set();
      console.log('ExerciseSet state changed:', set);
    });
  }

  onRepsInput(event: CustomEvent<{ value?: string | number | null }>) {
    const rawValue = event.detail.value;
    const reps = rawValue === null || rawValue === undefined || rawValue === '' ? 0 : Number(rawValue);
    this.set().reps.set(Number.isFinite(reps) ? reps : 0);
  }

  onWeightInput(event: CustomEvent<{ value?: string | number | null }>) {
    const rawValue = event.detail.value;
    const weight = rawValue === null || rawValue === undefined || rawValue === '' ? 0 : Number(rawValue);
    this.set().weight.set(Number.isFinite(weight) ? weight : 0);
  }
}
