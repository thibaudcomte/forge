import { RelativeDatePipe } from './relative-date-pipe';

describe('RelativeDatePipe', () => {
  it('returns "Today" for the current date', () => {
    const pipe = new RelativeDatePipe();
    const result = pipe.transform(new Date());
    expect(result).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const pipe = new RelativeDatePipe();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = pipe.transform(yesterday);
    expect(result).toBe('Yesterday');
  });

  it('returns the correct number of days ago for a date in the past', () => {
    const pipe = new RelativeDatePipe();
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 5);
    const result = pipe.transform(daysAgo);
    expect(result).toBe('5 days ago');
  });
});
