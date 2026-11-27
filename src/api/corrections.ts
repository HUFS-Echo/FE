import { CORRECTION_HISTORY } from '../config/learning';
import { mockRequest } from './client';
import type { CorrectionList, FeedbackReportType } from './types';
import { createRelativeMockTimestamp } from './mockDate';
/** B8 GET /student/corrections?week=&courseId=&cursor=&size=20 — Bearer(학생만) */
const correctionSchedule: Array<[number, string]> = [[0, '10:42'], [0, '09:18'], [1, '16:05'], [1, '14:32']];
const correctionWeeks = [...new Set(CORRECTION_HISTORY.map((item) => Number(item.week.replace(/\D/g, ''))).filter((week) => Number.isInteger(week)))].sort((a, b) => a - b);
export function getCorrections(filters: { week?: number; courseId?: number; cursor?: string; size?: number } = {}) { return mockRequest<CorrectionList>('B8', () => ({ weeks: correctionWeeks, items: CORRECTION_HISTORY.filter((item) => !filters.week || Number(item.week.replace(/\D/g, '')) === filters.week).map((item, index) => ({ correctionId: index + 1, week: Number(item.week.replace(/\D/g, '')) || 3, tag: item.tag, original: item.original, corrected: item.corrected, explanation: item.explanation, createdAt: createRelativeMockTimestamp(...(correctionSchedule[index] ?? [index + 1, '10:40'])), courseId: item.subject === 'grammar' ? 1 : item.subject === 'writing' ? 2 : 3, courseTitle: item.subject === 'grammar' ? '포르투갈어 문법' : item.subject === 'writing' ? '포르투갈어 읽기와 쓰기' : '포르투갈어 회화', repeatCount: item.repeat })), nextCursor: null })); }
/** B11 POST /corrections/{correctionId}/reports — Bearer(학생만); 미연결 목 API */
export function reportCorrection(correctionId: number, input: { type: FeedbackReportType; comment: string }) { return mockRequest('B11', () => ({ reportId: correctionId + 100, status: 'OPEN' as const, ...input })); }
