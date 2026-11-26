import { clearSession } from '../lib/session';
import type { ApiEnvelope } from './types';

/** 실제 서버 연결은 후속 작업에서만 활성화합니다. */
export const USE_MOCK = true as const;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
export const MOCK_DELAY_ENABLED = false;
export const MOCK_FORCE_ERROR = false;
let mockDelayEnabled = MOCK_DELAY_ENABLED;
let mockForceError = MOCK_FORCE_ERROR;

export class ApiError extends Error {
  constructor(public readonly code: number, public readonly errorCode: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setMockOptions(options: { delay?: boolean; forceError?: boolean }) {
  if (options.delay !== undefined) mockDelayEnabled = options.delay;
  if (options.forceError !== undefined) mockForceError = options.forceError;
}

/** Future transport hook: callers can supply an access token without hard-coding credentials. */
export function getAuthHeaders(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success) {
    if (envelope.code === 401 && typeof window !== 'undefined') {
      clearSession();
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    throw new ApiError(envelope.code, envelope.error_code ?? 'UNKNOWN_ERROR', envelope.message);
  }
  return envelope.data as T;
}

/** All current requests are mock-only; no fetch/XHR is issued by this transport. */
export async function mockRequest<T>(operation: string, factory: () => T | Promise<T>, message = '요청이 완료됐어요.'): Promise<T> {
  if (mockDelayEnabled) await new Promise((resolve) => window.setTimeout(resolve, 300));
  if (mockForceError) return unwrap<T>({ success: false, code: 500, error_code: 'MOCK_FORCED_ERROR', message: '목 API 강제 오류입니다.', data: null as T });
  try {
    const data = await factory();
    return unwrap({ success: true, code: 200, message: `${operation}: ${message}`, data });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'MOCK_ERROR', error instanceof Error ? error.message : '목 API 오류가 발생했어요.');
  }
}

export function fail(code: number, errorCode: string, message: string): never {
  throw new ApiError(code, errorCode, message);
}
