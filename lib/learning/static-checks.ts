import type { StaticCheckId } from "./exercise-catalog";

function normalizeCode(code: string) {
  return code.replace(/\s+/g, " ").trim();
}

function findUseEffectBody(code: string) {
  const match = code.match(/useEffect\s*\(\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/);

  if (!match || match.index === undefined) {
    return null;
  }

  let depth = 0;
  let started = false;
  const start = code.indexOf("{", match.index);

  for (let index = start; index < code.length; index += 1) {
    const char = code[index];

    if (char === "{") {
      depth += 1;
      started = true;
    } else if (char === "}") {
      depth -= 1;

      if (started && depth === 0) {
        return code.slice(start + 1, index);
      }
    }
  }

  return null;
}

const STATIC_CHECK_RUNNERS: Record<StaticCheckId, (code: string) => boolean> = {
  "contains-array-map": (code) =>
    /\.map\s*\(/.test(code) || /map\s*\(/.test(code),

  "jsx-list-has-key": (code) =>
    /key\s*=\s*{/.test(code) || /key\s*=\s*"/.test(code) || /key\s*=\s*'/.test(code),

  "references-skill-name": (code) =>
    /skill\.name/.test(code) || /skills\[/.test(code),

  "references-skill-level": (code) =>
    /skill\.level/.test(code) || /level/.test(code),

  "has-empty-state-branch": (code) =>
    /skills\.length\s*===\s*0/.test(code) ||
    /skills\.length\s*==\s*0/.test(code) ||
    /!skills\.length/.test(code) ||
    /skills\.length\s*<\s*1/.test(code),

  "contains-use-effect": (code) => /useEffect\s*\(/.test(code),

  "contains-set-interval": (code) => /setInterval\s*\(/.test(code),

  "has-effect-cleanup-return": (code) => {
    const body = findUseEffectBody(code);

    if (!body) {
      return /useEffect[\s\S]*return\s*\(/.test(code) || /useEffect[\s\S]*return\s+\(\)\s*=>/.test(code);
    }

    return /\breturn\b/.test(body);
  },

  "contains-clear-interval": (code) => /clearInterval\s*\(/.test(code),

  "contains-use-memo": (code) => /useMemo\s*\(/.test(code),

  "contains-use-callback": (code) => /useCallback\s*\(/.test(code),

  "contains-react-memo": (code) =>
    /React\.memo\s*\(/.test(code) ||
    /memo\s*\(/.test(code) ||
    /import\s*\{[^}]*\bmemo\b[^}]*\}\s*from\s*["']react["']/.test(code),

  "contains-export-default": (code) => /export\s+default\s+function/.test(code),

  "contains-async-await": (code) =>
    /async\s+function/.test(code) && /\bawait\b/.test(code),

  "contains-next-response": (code) => /NextResponse/.test(code),

  "contains-suspense": (code) =>
    /<Suspense\b/.test(code) || /Suspense\s*[,}]/.test(code),

  "contains-revalidate": (code) => /revalidate\s*:/.test(code),

  "contains-middleware": (code) =>
    /export\s+function\s+middleware/.test(code) ||
    /export\s+async\s+function\s+middleware/.test(code),

  "contains-database-query": (code) =>
    /prisma\.[a-zA-Z]+\.(findMany|findFirst|findUnique|count|queryRaw)/.test(
      code,
    ),
};

export function runStaticCheck(checkId: StaticCheckId, code: string) {
  const runner = STATIC_CHECK_RUNNERS[checkId];
  const normalized = normalizeCode(code);
  return runner(normalized);
}

export function runStaticChecksForRubric(
  code: string,
  rubric: Array<{ id: string; staticCheck?: StaticCheckId }>,
) {
  const results: Record<string, boolean> = {};

  for (const item of rubric) {
    if (!item.staticCheck) {
      continue;
    }

    results[item.id] = runStaticCheck(item.staticCheck, code);
  }

  return results;
}
