import type { Role as ApiRole, ScopeStatus } from './types';
import type { SubjectId } from '../config/learning';

/** Convert internal screen roles to the API enum at the request boundary. */
export const toApiRole = (role: 'student' | 'professor'): ApiRole => role === 'student' ? 'STUDENT' : 'PROFESSOR';
export const toUiRole = (role: ApiRole): 'student' | 'professor' => role === 'STUDENT' ? 'student' : 'professor';
export const toApiCourseType = (subject: SubjectId) => subject === 'grammar' ? 'GRAMMAR' as const : subject === 'writing' ? 'WRITING' as const : 'SPEAKING' as const;
export const toCourseId = (subject: SubjectId) => subject === 'grammar' ? 1 : subject === 'writing' ? 2 : 3;
export const toSubjectId = (courseId: number): SubjectId => courseId === 2 ? 'writing' : courseId === 3 ? 'speaking' : 'grammar';
export const toApiStatus = (status: 'ended' | 'active' | 'scheduled' | 'draft'): ScopeStatus => status === 'ended' ? 'DONE' : status === 'active' ? 'IN_PROGRESS' : status === 'scheduled' ? 'SCHEDULED' : 'DRAFT';
