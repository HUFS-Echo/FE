export { SUBJECTS, WEEK, WEEKS, READING_QUESTIONS, CORRECTION_HISTORY, COURSE_LABELS, HISTORY_WEEK_FILTERS, getSubject, isCourseDisabled, type SubjectId, type HistoryItem, type ReadingQuestion } from '../config/learning';
export { WRITING_READING_QUESTIONS } from '../config/writingReadingPractice';
export { SPEAKING_PRACTICE_QUESTIONS } from '../config/speakingPractice';
export { createScopeExercises } from '../config/scopePreview';
export { getDemoState, updateDemoState, resetDemoState, type DemoState, type LearningScope, type FeedbackCase } from '../lib/demoStore';
export { DEMO_STUDENT, DEMO_PROFESSOR, getSavedProfile, readSession, saveSession, clearSession, type Session, type Role } from '../lib/session';

import type { Role as ApiRole, ScopeStatus } from './types';
import type { SubjectId } from '../config/learning';
export const toApiRole = (role: 'student' | 'professor'): ApiRole => role === 'student' ? 'STUDENT' : 'PROFESSOR';
export const toUiRole = (role: ApiRole): 'student' | 'professor' => role === 'STUDENT' ? 'student' : 'professor';
export const toApiCourseType = (subject: SubjectId) => subject === 'reading' ? 'GRAMMAR' as const : subject === 'writing' ? 'WRITING' as const : 'SPEAKING' as const;
export const toCourseId = (subject: SubjectId) => subject === 'reading' ? 1 : subject === 'writing' ? 2 : 3;
export const toSubjectId = (courseId: number): SubjectId => courseId === 2 ? 'writing' : courseId === 3 ? 'speaking' : 'reading';
export const toApiStatus = (status: 'ended' | 'active' | 'scheduled' | 'draft'): ScopeStatus => status === 'ended' ? 'DONE' : status === 'active' ? 'IN_PROGRESS' : status === 'scheduled' ? 'SCHEDULED' : 'DRAFT';
