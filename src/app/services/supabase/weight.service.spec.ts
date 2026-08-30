import { beforeEach, describe, expect, it, vi } from 'vitest';

import { supabase } from './client';
import { WeightService } from './weight.service';

vi.mock('./client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('WeightService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records a weight entry using an ISO timestamp and body-fat value', async () => {
    const insert = vi.fn().mockResolvedValue({ data: null, error: null });
    const query = {
      insert,
    };

    vi.mocked(supabase.from).mockReturnValue(query as any);

    const service = new WeightService();
    const date = new Date('2026-08-30T12:00:00Z');

    await service.recordWeight(date, 74.5, 18.2);

    expect(supabase.from).toHaveBeenCalledWith('weight_entries');
    expect(insert).toHaveBeenCalledWith({
      recorded_at: '2026-08-30T12:00:00.000Z',
      weight_kg: 74.5,
      body_fat_pct: 18.2,
    });
  });

  it('loads entries bounded by a date range using min/max filters', async () => {
    const min = new Date('2026-08-01T00:00:00Z');
    const max = new Date('2026-08-31T23:59:59Z');
    const expected = [{ recorded_at: '2026-08-15T00:00:00.000Z', weight_kg: 73.4, body_fat_pct: 17.5 }];

    const gte = vi.fn().mockReturnThis();
    const lte = vi.fn().mockReturnThis();
    const select = vi.fn().mockReturnThis();
    const order = vi.fn().mockReturnThis();
    const query = {
      select,
      order,
      gte,
      lte,
      then: undefined,
    };

    vi.mocked(supabase.from).mockReturnValue(query as any);
    Object.assign(query, {
      then: (onFulfilled: (value: { data: typeof expected; error: null }) => unknown) =>
        Promise.resolve({ data: expected, error: null }).then(onFulfilled),
    });

    const service = new WeightService();
    const result = await service.getWeights({ min, max });

    expect(result).toEqual(expected);
    expect(supabase.from).toHaveBeenCalledWith('weight_entries');
    expect(select).toHaveBeenCalledWith('recorded_at, weight_kg, body_fat_pct');
    expect(order).toHaveBeenCalledWith('recorded_at', { ascending: true });
    expect(gte).toHaveBeenCalledWith('recorded_at', min.toISOString());
    expect(lte).toHaveBeenCalledWith('recorded_at', max.toISOString());
  });
});
