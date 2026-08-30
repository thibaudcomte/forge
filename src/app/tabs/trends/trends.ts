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

  readonly weightDifference = computed(() => {
    const entries = this.weightEntries();
    if (entries.length < 2) {
      return 0;
    }

    const firstEntry = entries[0];
    const latestEntry = this.latestWeightEntry()!;
    return latestEntry.weightKg - firstEntry.weightKg;
  });

  readonly weightSummary = computed(() => {
    const latestEntry = this.latestWeightEntry();
    if (!latestEntry) {
      return 'No logged data yet.';
    }

    const latestEntryDate = new Date(latestEntry.recordedAt);
    const today = new Date();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysSinceLastEntry = Math.floor((today.getTime() - latestEntryDate.getTime()) / millisecondsPerDay);

    return daysSinceLastEntry === 1 ? `Last logged: 1 day ago` : `Last logged: ${daysSinceLastEntry} days ago`;
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
