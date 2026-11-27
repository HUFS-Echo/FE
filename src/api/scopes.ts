import { getDemoState, updateDemoState, type LearningScope as StoredScope } from '../lib/demoStore';
import { createScopeExercises } from '../config/scopePreview';
import { DEMO_REFERENCE_DATE, DEMO_WEEK_DATES } from './mockDate';
import { mockRequest, fail } from './client';
import type { ExerciseType, LearningScope, Question, ScopeList, ScopeStatus } from './types';
const asApiScope = (scope: StoredScope): LearningScope => ({ scopeId: scope.scopeId, courseId: scope.courseId, sectionId: scope.sectionId, week: scope.week, materialId: scope.materialId, startPage: scope.startPage, endPage: scope.endPage, title: scope.title, exerciseType: scope.exerciseType, questions: scope.questions, status: scope.status, updatedAt: scope.updatedAt });
const requireScope = (scopeId: number) => { const scope = getDemoState().scopes.find((item) => item.scopeId === scopeId); if (!scope) fail(404, 'SCOPE_NOT_FOUND', '학습 범위를 찾을 수 없어요.'); return scope; };
/** A19 POST /prof/scopes — Bearer(교수만) */
export function createScope(input: { courseId: number; sectionId: number; week: number; materialId: number; startPage: number; endPage: number; exerciseType: ExerciseType; questions: Question[]; title?: string }) { return mockRequest<{ scopeId: number; status: ScopeStatus }>('A19', () => {
  if (input.endPage - input.startPage > 9 || input.startPage < 1) fail(400, 'INVALID_PAGE_RANGE', '최대 10쪽까지 설정할 수 있어요.');
  if (getDemoState().scopes.some((scope) => scope.courseId === input.courseId && scope.sectionId === input.sectionId && scope.week === input.week)) fail(409, 'SCOPE_ALREADY_EXISTS', '이 주차에는 이미 학습 범위가 있어요.');
  const scopeId = Date.now();
  const range = `${input.startPage}–${input.endPage}`;
  const dates = DEMO_WEEK_DATES[input.week] ?? DEMO_WEEK_DATES[3];
  const scope: StoredScope = { scopeId, courseId: input.courseId, sectionId: input.sectionId, week: input.week, materialId: input.materialId, startPage: input.startPage, endPage: input.endPage, startDate: dates.startDate, endDate: dates.endDate, pdfPages: range, title: input.title ?? '', exerciseType: input.exerciseType, questions: input.questions, status: 'DRAFT', participants: null, accuracy: null, updatedAt: new Date().toISOString() };
  updateDemoState((state) => ({ ...state, scopes: [...state.scopes, scope] }));
  return { scopeId, status: 'DRAFT' as const };
}, '학습 범위를 만들었어요.'); }
/** A20 GET /prof/scopes?courseId=&sectionId= — Bearer(교수만) */
export function getScopes(courseId = 1, sectionId = 1) { return mockRequest<ScopeList>('A20', () => {
  const scopes = getDemoState().scopes.filter((scope) => scope.sectionId === sectionId && (courseId === 0 || scope.courseId === courseId));
  const publishedScopes = scopes.filter((scope) => scope.status === 'DONE' || scope.status === 'IN_PROGRESS');
  const participation = publishedScopes.map((scope) => scope.participants).filter((value): value is number => value != null);
  return { summary: { published: publishedScopes.length, scheduledOrDraft: scopes.filter((scope) => scope.status === 'SCHEDULED' || scope.status === 'DRAFT').length, avgParticipation: participation.length ? Math.round(participation.reduce((sum, value) => sum + value, 0) / participation.length) : 0 }, studentCount: sectionId === 1 ? 48 : 0, scopes: scopes.map((scope) => ({ scopeId: scope.scopeId, week: scope.week, startDate: scope.startDate, endDate: scope.endDate, pdfPages: scope.pdfPages, title: scope.title, status: scope.status, participants: ['DRAFT', 'SCHEDULED', 'LOCKED'].includes(scope.status) ? null : scope.participants, accuracy: ['DRAFT', 'SCHEDULED', 'LOCKED'].includes(scope.status) ? null : scope.accuracy })) };
}); }
/** A21 PUT /prof/scopes/{scopeId} — Bearer(교수만) */
export function updateScope(scopeId: number, input: Partial<Omit<LearningScope, 'status'>>) { return mockRequest<LearningScope>('A21', () => {
  requireScope(scopeId);
  let updated!: StoredScope;
  updateDemoState((state) => ({ ...state, scopes: state.scopes.map((scope) => {
    if (scope.scopeId !== scopeId) return scope;
    updated = { ...scope, ...input, scopeId, pdfPages: input.startPage !== undefined || input.endPage !== undefined ? `${input.startPage ?? scope.startPage}–${input.endPage ?? scope.endPage}` : scope.pdfPages, updatedAt: new Date().toISOString() };
    return updated;
  }) }));
  return asApiScope(updated);
}, '학습 범위를 수정했어요.'); }
/** A22 GET /prof/scopes/{scopeId} — Bearer(교수만) */
export function getScope(scopeId: number) { return mockRequest<LearningScope>('A22', () => asApiScope(requireScope(scopeId))); }
/** A23 POST /prof/scopes/{scopeId}/publish — Bearer(교수만) */
export function publishScope(scopeId: number) { return mockRequest<{ scopeId: number; status: ScopeStatus; opensAt?: string }>('A23', () => {
  const target = requireScope(scopeId);
  if (!target.title || target.questions.length < 1) fail(400, 'SCOPE_INCOMPLETE', '주제와 연습 문제를 한 개 이상 넣어 주세요.');
  // The mock uses its fixed demo clock; real API servers decide against the actual server date.
  const status: ScopeStatus = target.startDate <= DEMO_REFERENCE_DATE ? 'IN_PROGRESS' : 'SCHEDULED';
  const opensAt = status === 'SCHEDULED' ? target.startDate : undefined;
  updateDemoState((state) => ({ ...state, scopes: state.scopes.map((scope) => scope.scopeId === scopeId ? { ...scope, status, participants: status === 'SCHEDULED' ? null : scope.participants ?? 0, accuracy: status === 'SCHEDULED' ? null : scope.accuracy ?? 0, updatedAt: new Date().toISOString() } : scope) }));
  return { scopeId, status, ...(opensAt ? { opensAt } : {}) };
}, '학습 범위를 게시했어요.'); }
/** A24 POST /prof/scopes/ai/exercises — Bearer(교수만) */
export function generateExercises(input: { courseId: number; materialId: number; startPage: number; endPage: number; exerciseType: ExerciseType; count: number }) { return mockRequest('A24', () => {
  if (!input.exerciseType) fail(400, 'INVALID_EXERCISE_TYPE', '출제 유형을 선택해 주세요.');
  const subject = input.courseId === 2 ? '포르투갈어 읽기와 쓰기' as const : input.courseId === 3 ? '포르투갈어 회화' as const : '포르투갈어 문법' as const;
  const exercises = createScopeExercises(subject, input.startPage, input.endPage);
  return { exerciseType: input.exerciseType, scopeTitle: input.courseId === 1 ? '부정관사와 명사의 성·수 일치' : input.courseId === 2 ? '학교 파티 일기 쓰기' : '집과 생활 공간 묘사', instruction: '문제를 읽고 답을 선택하거나 입력해 보세요.', questions: exercises.slice(0, input.count).map((item) => ({ format: 'MULTIPLE_CHOICE', sentence: item.prompt, choices: item.options ?? null, answer: item.answer, sourcePage: item.page, explanation: item.explanation })) };
}, 'AI 연습 문제를 만들었어요.'); }
