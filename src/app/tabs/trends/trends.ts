import { Component, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowUpOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'trends',
  imports: [
    IonBadge,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonText,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCardHeader,
    IonCardContent,
    IonHeader,
    IonIcon,
    IonButton,
    IonProgressBar,
  ],
  templateUrl: './trends.html',
})
export class TrendsPage {
  readonly selectedRange = signal<30 | 90>(30);

  selectRange(range: 30 | 90): void {
    this.selectedRange.set(range);
  }

  constructor() {
    addIcons({ arrowUpOutline, checkmarkCircleOutline, alertCircleOutline });
  }
}
