import { CORRECTION_HISTORY } from '../config/learning';
import { getDemoState, updateDemoState } from '../lib/demoStore';
import { fail, mockRequest } from './client';
import type { CorrectionList, FeedbackReportType } from './types';
import { createRelativeMockTimestamp } from './mockDate';

/** B8 GET /student/corrections?week=&courseId=&cursor=&size=20 — Bearer(학생만) */
const correctionSchedule: Array<[number, string]> = [[0, '10:42'], [0, '09:18'], [1, '16:05'], [1, '14:32']];
const correctionWeeks = [...new Set(CORRECTION_HISTORY.map((item) => Number(item.week.replace(/\D/g, ''))).filter((week) => Number.isInteger(week)))].sort((a, b) => a - b);
const reportTypeLabels: Record<FeedbackReportType, string> = {
  OVER_CORRECTION: '과잉 교정',
  TERM_CONFUSION: '문법 용어 혼동',
  WRONG_CORRECTION: '틀린 교정',
  OTHER: '기타',
};
const courseIdBySubject = { grammar: 1, writing: 2, speaking: 3 } as const;

export function getCorrections(filters: { week?: number; courseId?: number; cursor?: string; size?: number } = {}) {
  return mockRequest<CorrectionList>('B8', () => {
    const feedback = getDemoState().feedback;
    const items = CORRECTION_HISTORY.map((item, index) => {
      const correctionId = index + 1;
      const week = Number(item.week.replace(/\D/g, '')) || 3;
      return {
        correctionId,
        week,
        tag: item.tag,
        original: item.original,
        corrected: item.corrected,
        explanation: item.explanation,
        createdAt: createRelativeMockTimestamp(...(correctionSchedule[index] ?? [index + 1, '10:40'])),
        courseId: courseIdBySubject[item.subject],
        courseTitle: item.subject === 'grammar' ? '포르투갈어 문법' : item.subject === 'writing' ? '포르투갈어 읽기와 쓰기' : '포르투갈어 회화',
        repeatCount: item.repeat,
        reported: feedback.some((report) => report.correctionId === correctionId),
      };
    }).filter((item) => !filters.week || item.week === filters.week);
    return { weeks: correctionWeeks, items, nextCursor: null };
  });
}

/** B11 POST /corrections/{correctionId}/reports — Bearer(학생만) */
export function reportCorrection(correctionId: number, input: { type: FeedbackReportType; comment: string }) {
  return mockRequest<{ reportId: number; status: 'OPEN' }>('B11', () => {
    const correction = CORRECTION_HISTORY[correctionId - 1];
    if (!correction) fail(404, 'CORRECTION_NOT_FOUND', '신고할 교정을 찾을 수 없어요.');
    const currentState = getDemoState();
    if (currentState.feedback.some((report) => report.correctionId === correctionId)) {
      fail(409, 'ALREADY_REPORTED', '이미 신고한 교정이에요.');
    }
    const reportId = Math.max(30, ...currentState.feedback.map((report) => report.reportId)) + 1;
    const week = Number(correction.week.replace(/\D/g, '')) || 3;
    updateDemoState((state) => ({
      ...state,
      feedback: [{
        reportId,
        correctionId,
        courseId: courseIdBySubject[correction.subject],
        sectionId: 1,
        type: input.type,
        typeLabel: reportTypeLabels[input.type],
        reportedAt: new Date().toISOString(),
        week,
        // Current correction-history mock entries are all from the week-3 material.
        sourcePage: 29,
        student: { maskedName: '한*린', maskedStudentNo: '2025****56' },
        studentSentence: correction.original,
        aiCorrection: correction.corrected,
        aiExplanation: correction.explanation,
        comment: input.comment,
        status: 'OPEN',
      }, ...state.feedback],
    }));
    return { reportId, status: 'OPEN' as const };
  }, '신고가 접수됐어요.');
}
