import { Service, signal } from '@angular/core';

@Service()
export class LogState {
  readonly activeWorkoutProgramId = signal<number | undefined>(undefined);

  beginWorkout(programId: number) {
    this.activeWorkoutProgramId.set(programId);
  }

  endWorkout() {
    this.activeWorkoutProgramId.set(undefined);
  }
}
