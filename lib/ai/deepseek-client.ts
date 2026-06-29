import { createDeepSeek } from "@ai-sdk/deepseek";

import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

const CHAT_FETCH_TIMEOUT_MS = 28_000;
const GRADING_FETCH_TIMEOUT_MS = 60_000;

function createTimeoutFetch(timeoutMs: number) {
  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetchWithTimeout(input, init, timeoutMs);
}

const providerSettings = {
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
};

export const deepseek = createDeepSeek({
  ...providerSettings,
  fetch: createTimeoutFetch(CHAT_FETCH_TIMEOUT_MS),
});

export const gradingDeepseek = createDeepSeek({
  ...providerSettings,
  fetch: createTimeoutFetch(GRADING_FETCH_TIMEOUT_MS),
});
