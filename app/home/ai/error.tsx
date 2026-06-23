"use client";

import { useEffect } from "react";

import { HomeRouteError, RetryButton } from "@/app/home/components/route-state";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <HomeRouteError
      kind="ai"
      digest={error.digest}
      retryAction={<RetryButton onClick={unstable_retry} />}
    />
  );
}
