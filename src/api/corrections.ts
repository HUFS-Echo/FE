import { CORRECTION_HISTORY } from '../config/learning';
import { mockRequest } from './client';
import type { CorrectionList, FeedbackReportType } from './types';
/** B8 GET /student/corrections?week=&courseId=&cursor=&size=20 — Bearer(학생만) */
export function getCorrections(filters: { week?: number; courseId?: number; cursor?: string; size?: number } = {}) { return mockRequest<CorrectionList>('B8', () => ({ weeks: [1, 2, 3], items: CORRECTION_HISTORY.filter((item) => !filters.week || Number(item.week.replace(/\D/g, '')) === filters.week).map((item, index) => ({ correctionId: index + 1, week: Number(item.week.replace(/\D/g, '')) || 3, tag: item.tag, original: item.original, corrected: item.corrected, explanation: item.explanation, createdAt: '2026-11-23T10:40:00', courseId: item.subject === 'reading' ? 1 : item.subject === 'writing' ? 2 : 3, courseTitle: item.subject === 'reading' ? '포르투갈어 문법' : item.subject === 'writing' ? '포르투갈어 읽기와 쓰기' : '포르투갈어 회화', repeatCount: item.repeat })), nextCursor: null })); }
/** B11 POST /corrections/{correctionId}/reports — Bearer(학생만); 미연결 목 API */
export function reportCorrection(correctionId: number, input: { type: FeedbackReportType; comment: string }) { return mockRequest('B11', () => ({ reportId: correctionId + 100, status: 'OPEN' as const, ...input })); }
