import { clearSession, readAccessToken } from '../lib/session';
import type { ApiEnvelope } from './types';

/** Actual API calls stay disabled by default; never disable for this demo-only task. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
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

/** Header factory used by the future fetch transport and easy to test independently. */
export function getAuthHeaders(accessToken = readAccessToken()): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function goToLogin() {
  if (typeof window === 'undefined') return;
  clearSession();
  window.history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success) {
    if (envelope.code === 401) goToLogin();
    throw new ApiError(envelope.code, envelope.error_code ?? 'UNKNOWN_ERROR', envelope.message);
  }
  return envelope.data as T;
}

/** All current endpoint functions call this mock transport; it issues no fetch/XHR. */
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

export type FetchRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  accessToken?: string;
};

/** Future live transport seam. API modules must provide their own method/path and remain mock-only here. */
export async function fetchRequest<T>(request: FetchRequest): Promise<T> {
  if (USE_MOCK) throw new ApiError(0, 'MOCK_TRANSPORT_ONLY', '현재 endpoint는 목 API 전용입니다.');
  if (!API_BASE_URL) throw new ApiError(0, 'API_BASE_URL_MISSING', 'VITE_API_BASE_URL을 설정해 주세요.');
  const isFormData = typeof FormData !== 'undefined' && request.body instanceof FormData;
  const headers: Record<string, string> = { ...getAuthHeaders(request.accessToken) };
  if (request.body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${request.path}`, {
      method: request.method,
      headers,
      ...(request.body === undefined ? {} : { body: isFormData ? request.body as FormData : JSON.stringify(request.body) }),
    });
  } catch (error) {
    throw new ApiError(0, 'NETWORK_ERROR', error instanceof Error ? error.message : '서버에 연결할 수 없어요.');
  }
  let envelope: ApiEnvelope<T> | null = null;
  try { envelope = await response.json() as ApiEnvelope<T>; } catch { /* malformed or empty body handled below */ }
  if (response.status === 401) {
    goToLogin();
    throw new ApiError(401, envelope?.error_code ?? 'UNAUTHORIZED', envelope?.message ?? '로그인이 만료됐어요. 다시 로그인해 주세요.');
  }
  if (!envelope || typeof envelope.success !== 'boolean') {
    throw new ApiError(response.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않아요.');
  }
  return unwrap(envelope);
}

export function fail(code: number, errorCode: string, message: string): never {
  throw new ApiError(code, errorCode, message);
}
