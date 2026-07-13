import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { LogState } from '../../state/log-state';

interface Program {
  id: number;
  name: string;
  label: string;
  exercises: number;
  lastPerformedAt: Date | null;
  isNextScheduled: boolean;
}

@Component({
  selector: 'training',
  imports: [
    IonIcon,
    IonToolbar,
    IonText,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonButton,
    DatePipe,
  ],
  templateUrl: './training.html',
})
export class TrainingPage implements OnInit {
  constructor() {
    addIcons({ calendarOutline });
  }

  private readonly supabase = inject(SupabaseService);
  private readonly state = inject(LogState);
  private readonly router = inject(Router);

  programs = signal<Program[]>([]);

  async ngOnInit() {
    const rawPrograms = await this.supabase.getProgramsLight();
    const sorted = [...rawPrograms].sort(
      (a, b) => (a.lastPerformedAt?.getTime() ?? 0) - (b.lastPerformedAt?.getTime() ?? 0),
    );
    const programs = sorted.map(
      (p, i) =>
        ({
          id: p.id,
          name: p.name,
          label: p.description,
          exercises: p.exercisesCount,
          lastPerformedAt: p.lastPerformedAt,
          isNextScheduled: i === 0,
        }) as Program,
    );
    this.programs.set(programs);
  }

  startWorkout(programId: number) {
    this.state.beginWorkout(programId);
    this.router.navigate(['/tabs/log', programId]);
  }
}
