export type WeakPointSeverity = "high" | "medium" | "low";

const SEVERITY_BY_INDEX: WeakPointSeverity[] = ["high", "medium", "low"];

export function mapWeakPoints(topics: string[]) {
  return topics.slice(0, 3).map((title, index) => ({
    title,
    severity: SEVERITY_BY_INDEX[index] ?? "low",
  }));
}
