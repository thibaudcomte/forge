import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, calendarClearOutline, playCircleOutline, scaleOutline } from 'ionicons/icons';
import { TrainingService } from '../../services/supabase/training.service';
import { WeightEntry, WeightService } from '../../services/supabase/weight.service';
import { LogState } from '../../state/log-state';

interface Program {
  id: number;
  name: string;
  label: string;
  exercises: number;
}

@Component({
  selector: 'home',
  imports: [
    IonInput,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonText,
    IonIcon,
    IonCardSubtitle,
  ],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  constructor() {
    addIcons({ calendarClearOutline, playCircleOutline, addCircleOutline, scaleOutline });
  }

  private readonly supabase = inject(TrainingService);
  private readonly weightService = inject(WeightService);
  private readonly state = inject(LogState);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  todaysProgram = signal<Program | undefined>(undefined);

  async ngOnInit() {
    const programs = await this.supabase.getProgramsLight();
    const sorted = [...programs].sort(
      (a, b) => (a.lastPerformedAt?.getTime() ?? 0) - (b.lastPerformedAt?.getTime() ?? 0),
    );
    const todaysRawProgram = sorted[0];
    this.todaysProgram.set({
      id: todaysRawProgram.id,
      name: todaysRawProgram.name,
      label: todaysRawProgram.description,
      exercises: todaysRawProgram.exercisesCount,
    });

    this.latestBodyWeightReading.set(await this.weightService.getLatestWeightReading());
  }

  startWorkout() {
    const program = this.todaysProgram();
    if (!program) return;
    this.state.beginWorkout(program.id);
    this.router.navigate(['/tabs/log', program.id]);
  }

  latestBodyWeightReading = signal<WeightEntry | null>(null);

  bodyWeightSummary = computed(() => {
    const reading = this.latestBodyWeightReading();
    if (!reading) return '';
    const daysOld = Math.floor((new Date().getTime() - reading.recordedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOld <= 0) return 'Last Logged: today';
    if (daysOld === 1) return 'Last Logged: yesterday';
    return `Last Logged: ${daysOld} days ago`;
  });

  latestWeightPlaceholder = computed(() => `Weight : ${this.latestBodyWeightReading()?.weightKg} kg`);
  latestFatPlaceholder = computed(() => `Fat : ${this.latestBodyWeightReading()?.bodyFatPercentage ?? '-'} %`);
  latestMusclePlaceholder = computed(
    () => `Muscle Mass : ${this.latestBodyWeightReading()?.muscleMassPercentage ?? '-'} %`,
  );

  async addWeight(weight: number, bodyFat?: number, muscleMass?: number) {
    if (weight <= 0) return;
    if (!!bodyFat && bodyFat <= 0) return;
    if (!!muscleMass && muscleMass <= 0) return;

    await this.weightService.recordWeight(new Date(), weight, bodyFat, muscleMass);

    const toast = await this.toastController.create({
      message: 'Weight saved',
      duration: 3_000,
      position: 'bottom',
    });

    await toast.present();
  }
}
