export const DEFAULT_FETCH_TIMEOUT_MS = 15_000;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal =
    init?.signal != null
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;

  return fetch(input, { ...init, signal });
}
