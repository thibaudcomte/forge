import { inject, Service } from '@angular/core';
import { AuthService } from './auth.service';
import { supabase } from './client';

export interface WeightDateRange {
  min: Date;
  max: Date;
}

export interface WeightEntry {
  recordedAt: Date;
  weightKg: number;
  bodyFatPercentage: number | null;
}

@Service()
export class WeightService {
  private readonly auth = inject(AuthService);

  /**
   * Saves a single body-weight measurement.
   * @param recordedAt - When the reading was taken.
   * @param weightKg - Weight in kilograms.
   * @param bodyFatPct - Optional body-fat percentage.
   */
  async recordWeight(recordedAt: Date, weightKg: number, bodyFatPct?: number) {
    const { error } = await supabase.from('weight_entries').insert({
      recorded_at: recordedAt.toISOString(),
      weight_kg: weightKg,
      body_fat_pct: bodyFatPct ?? null,
      user_id: this.auth.user()?.id,
    });

    if (error) {
      console.error('Error recording weight entry:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Retrieves weight entries, optionally limited to an inclusive date range.
   * @param dateRange - The minimum and maximum timestamps to include.
   * @returns Ordered weight entries from the database.
   */
  async getWeights(dateRange?: WeightDateRange): Promise<WeightEntry[]> {
    let query = supabase
      .from('weight_entries')
      .select('recorded_at, weight_kg, body_fat_pct')
      .order('recorded_at', { ascending: true });

    if (dateRange) {
      query = query.gte('recorded_at', dateRange.min.toISOString()).lte('recorded_at', dateRange.max.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching weight entries:', error);
      throw new Error(error.message);
    }

    return data
      ? data.map((entry) => ({
          recordedAt: new Date(entry.recorded_at),
          weightKg: entry.weight_kg,
          bodyFatPercentage: entry.body_fat_pct ?? null,
        }))
      : [];
  }
}
