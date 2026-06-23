export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function fuzzyMatchText(text: string, query: string) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return true;
  }

  const normalized = normalizeSearchText(text);
  return tokens.every((token) =>
    normalized.includes(token.replace(/\s+/g, "")),
  );
}
