import { getDemoState } from '../lib/demoStore';
import { mockRequest } from './client';
import type { ApiQuery, Insights, WeeklyReport } from './types';
/** B16 GET /prof/insights?courseId=&sectionId=&week= — Bearer(교수만) */
export function getInsights(_filters: ApiQuery = {}) { return mockRequest<Insights>('B16', () => ({ headline: '관사와 명사의 성·수 일치 오류가 가장 많이 반복됐어요.', body: '학생들은 부정관사 um/uma의 형태는 알고 있지만, 뒤에 오는 명사의 성·수와 맞추는 과정에서 실수해요.', generatedAt: '2026-11-23T06:00:00' })); }
/** B17 GET /prof/reports/weekly?courseId=&sectionId=&week= — Bearer(교수만) */
export function getWeeklyReport(_filters: ApiQuery = {}) { return mockRequest<WeeklyReport>('B17', () => { const errors = getDemoState().scopes.flatMap((scope) => scope.exercises).slice(0, 3); if (!errors.length) return null; return { week: 3, startDate: '2026-11-17', endDate: '2026-11-23', errors: errors.map((item, index) => ({ rank: index + 1, tag: item.explanation || '관사와 명사의 성·수 일치', studentCount: 19 - index * 4, rate: 42 - index * 7, example: { original: item.prompt, corrected: item.answer }, moreExamples: [item.prompt] })) }; }); }
