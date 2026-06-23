function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function calculateStreakDays(dates: Date[], now = new Date()) {
  if (!dates.length) {
    return 0;
  }

  const uniqueDays = new Set(dates.map((date) => toDateKey(date)));
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
