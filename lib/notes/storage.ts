const UNTITLED_NOTE_TITLE = "未命名笔记";

export function extractNoteTitle(content: string, fallback = UNTITLED_NOTE_TITLE) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim().slice(0, 80) || fallback;
}

export function buildExcerpt(content: string, maxLength = 96) {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]+]\([^)]*\)/g, (value) => value.match(/\[([^\]]+)]/)?.[1] ?? "")
    .replace(/[#>*`_[\]()!-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain || "空白笔记";
  }

  return `${plain.slice(0, maxLength)}...`;
}

export function createDefaultNoteContent(title = UNTITLED_NOTE_TITLE) {
  return `# ${title}

在这里记录你的学习内容。

## 核心理解

- 

## 待办

- [ ] 
`;
}

export function formatNoteRelativeTime(iso: string) {
  const timestamp = new Date(iso).getTime();

  if (Number.isNaN(timestamp)) {
    return "刚刚";
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) {
    return "刚刚";
  }

  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "昨天";
  }

  if (days < 7) {
    return `${days} 天前`;
  }

  return new Date(iso).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export function createMarkdownFileName(title: string) {
  const normalized = title
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${normalized || "lingstack-note"}.md`;
}
