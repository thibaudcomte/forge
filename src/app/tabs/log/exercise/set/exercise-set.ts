import { Component, input } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import { WorkoutExerciseSet } from '../../log';

@Component({
  selector: 'exercise-set',
  imports: [IonInput],
  templateUrl: './exercise-set.html',
  styleUrl: './exercise-set.css',
})
export class ExerciseSetComponent {
  readonly set = input.required<WorkoutExerciseSet>();
  readonly hasHeader = input(false);
  readonly disabled = input(false);

  onRepsInput(event: CustomEvent<{ value?: string | number | null }>) {
    const reps = Number(event.detail.value);
    this.set().reps = Number.isFinite(reps) ? reps : 0;
  }

  onWeightInput(event: CustomEvent<{ value?: string | number | null }>) {
    const weight = Number(event.detail.value);
    this.set().weight = Number.isFinite(weight) ? weight : 0;
  }
}
