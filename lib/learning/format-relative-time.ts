export function formatRelativeTime(date: Date, now = new Date()) {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "刚刚";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  if (diffDays === 1) {
    return "昨天";
  }

  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}
