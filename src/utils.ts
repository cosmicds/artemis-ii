export function clampedTime(time: Date, min: Date, max: Date): Date {
  if (time < min) {
    return min;
  } else if (time > max) {
    return max;
  } else {
    return time;
  }
}