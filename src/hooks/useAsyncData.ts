import { useCallback, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | undefined;
  reload: () => void;
}

/*
 * Runs an async loader on mount (and whenever `deps` change) and tracks
 * loading / error state.
 *
 * Stale responses are ignored: if the deps change while a request is in
 * flight, the older result is discarded instead of overwriting the newer
 * one. This matters much more once these calls hit a real network.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
): AsyncDataState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
  let isActive = true;

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern; resetting loading/error before an async fetch is the documented use case for effects (react.dev/learn/synchronizing-with-effects#fetching-data)
  setIsLoading(true);
  setError(undefined);

  loader()
    .then((result) => {
      if (!isActive) return;
      setData(result);
    })
    .catch((caughtError) => {
      if (!isActive) return;
      console.error("Failed to load data:", caughtError);
      setError("Unable to load data. Please try again.");
    })
    .finally(() => {
      if (!isActive) return;
      setIsLoading(false);
    });

  return () => {
    isActive = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [...deps, reloadToken]);

  return { data, isLoading, error, reload };
}