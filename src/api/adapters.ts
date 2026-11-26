import type { Role as ApiRole, ScopeStatus } from './types';
import type { SubjectId } from '../config/learning';

/** Role values are shared with API_SPEC.md and pass through unchanged. */
export const toApiRole = (role: ApiRole): ApiRole => role;
export const toUiRole = (role: ApiRole): ApiRole => role;
export const toApiCourseType = (subject: SubjectId) => subject === 'grammar' ? 'GRAMMAR' as const : subject === 'writing' ? 'WRITING' as const : 'SPEAKING' as const;
export const toCourseId = (subject: SubjectId) => subject === 'grammar' ? 1 : subject === 'writing' ? 2 : 3;
export const toSubjectId = (courseId: number): SubjectId => courseId === 2 ? 'writing' : courseId === 3 ? 'speaking' : 'grammar';
export const toApiStatus = (status: ScopeStatus): ScopeStatus => status;
