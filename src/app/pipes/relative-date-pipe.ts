import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    // Convert string to Date if necessary
    const date = new Date(value);
    const now = new Date();

    // Normalize to midnight for comparison
    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Today ?
    if (date.getTime() === now.getTime()) {
      return 'Today';
    }

    // Yesterday ?
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    // X days ago
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const daysAgo = `${Math.floor(diffInSeconds / 86400)} days ago`;
    return daysAgo;
  }
}
