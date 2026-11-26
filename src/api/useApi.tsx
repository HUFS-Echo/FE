import { useCallback, useEffect, useState } from 'react';
export type ApiState<T> = { data: T | null; loading: boolean; error: Error | null; retry: () => void };
/** Small request-state hook; request functions remain owned by src/api modules. */
export function useApi<T>(request: () => Promise<T>, dependencies: readonly unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    request().then((result) => { if (active) setData(result); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason : new Error('요청을 불러오지 못했어요.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, attempt]);
  return { data, loading, error, retry };
}
export function ApiLoadingState({ label = '불러오는 중…' }: { label?: string }) { return <div className="api-state" role="status" aria-live="polite">{label}</div>; }
export function ApiErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) { return <div className="api-state api-state--error" role="alert"><span>{error.message}</span><button type="button" onClick={onRetry}>다시 시도</button></div>; }
export function ApiEmptyState({ message }: { message: string }) { return <div className="api-state" role="status">{message}</div>; }
