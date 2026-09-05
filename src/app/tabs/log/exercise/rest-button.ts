import { Component, input, linkedSignal, output } from '@angular/core';
import { IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { stopwatchOutline, timeOutline } from 'ionicons/icons';
import { SecondsPipe } from '../../../pipes/seconds-pipe';

@Component({
  selector: 'rest-button',
  imports: [IonButton, IonText, IonIcon, SecondsPipe],
  template: `
    <ion-button
      expand="block"
      fill="outline"
      color="secondary"
      class="btn-large-radius ion-padding-vertical"
      [disabled]="disabled()"
      (click)="start()"
    >
      <div class="ion-display-flex ion-align-items-center ion-justify-content-between bold gap">
        <ion-text>{{ seconds() === countdown() ? 'Start Rest' : 'Rest Left' }}</ion-text>
        <ion-icon name="stopwatch-outline"></ion-icon>
        <ion-text>{{ countdown() | seconds }}</ion-text>
      </div>
    </ion-button>
  `,
})
export class RestButton {
  seconds = input.required<number>();
  disabled = input<boolean>(false);
  countdown = linkedSignal(this.seconds);
  changed = output<'start' | 'stop'>();
  private intervalId = 0;

  constructor() {
    addIcons({ timeOutline, stopwatchOutline });
  }

  start() {
    if (this.intervalId > 0) return;
    this.changed.emit('start');
    this.intervalId = setInterval(() => {
      this.countdown.update((value) => Math.max(0, value - 1));
      if (this.countdown() === 0) {
        clearInterval(this.intervalId);
        this.intervalId = 0;
        this.changed.emit('stop');
      }
    }, 1000);
  }
}
