import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { environment } from '../../../environments/environment';
import { RelativeDatePipe } from '../../pipes/relative-date-pipe';
import { WeightEntry, WeightService } from '../../services/supabase/weight.service';

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
    RelativeDatePipe,
  ],
  templateUrl: './trends.html',
})
export class TrendsPage {
  private readonly weightService = inject(WeightService);

  readonly selectedRange = signal<30 | 90>(30);

  readonly weightEntries = signal<WeightEntry[]>([]);

  readonly latestWeightEntry = computed(() => {
    const entries = this.weightEntries();
    if (entries.length < 1) return null;
    return entries[entries.length - 1];
  });

  readonly bodyCompositionDelta = computed(() => {
    const entries = this.weightEntries();
    if (entries.length < 2) {
      return { weight: '-', muscleMass: '-', bodyFat: '-' };
    }

    const firstEntry = entries[0];
    const latestEntry = this.latestWeightEntry()!;

    const weightDelta = latestEntry.weightKg - firstEntry.weightKg;
    const muscleMassDelta = (latestEntry.muscleMassPercentage ?? 0) - (firstEntry.muscleMassPercentage ?? 0);
    const bodyFatDelta = (latestEntry.bodyFatPercentage ?? 0) - (firstEntry.bodyFatPercentage ?? 0);

    return {
      weight: weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1),
      muscleMass: muscleMassDelta > 0 ? `+${muscleMassDelta.toFixed(1)}` : muscleMassDelta.toFixed(1),
      bodyFat: bodyFatDelta > 0 ? `+${bodyFatDelta.toFixed(1)}` : bodyFatDelta.toFixed(1),
    };
  });

  readonly bmi = computed(() => {
    const value = (this.latestWeightEntry()?.weightKg ?? 0) / Math.max(1, (environment.user.height / 100) ^ 2);
    let status = 'Normal';
    if (value < 18.5) status = 'Underweight';
    if (value >= 25) status = 'Overweight';
    if (value >= 30) status = 'Obese';
    return { value, status };
  });

  selectRange(range: 30 | 90): void {
    this.selectedRange.set(range);
  }

  constructor() {
    addIcons({ arrowUpOutline, checkmarkCircleOutline, alertCircleOutline });

    effect(() => {
      const range = this.selectedRange();
      const today = new Date();
      const min = new Date(today);
      min.setDate(today.getDate() - range);
      min.setHours(0, 0, 0, 0);
      const max = new Date(today);
      max.setHours(23, 59, 59, 999);

      void this.weightService.getWeights({ min, max }).then((entries) => {
        this.weightEntries.set(entries);
      });
    });
  }
}
