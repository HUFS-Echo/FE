import { getDemoState, updateDemoState } from '../lib/demoStore';
import { mockRequest, fail } from './client';
import type { ApiQuery, FeedbackReports } from './types';

/** B13 GET /prof/feedback-reports?courseId=&sectionId=&week=&status=OPEN|RESOLVED — Bearer(교수만) */
export function getFeedbackReports(filters: ApiQuery & { status?: 'OPEN' | 'RESOLVED' } = {}) {
  return mockRequest<FeedbackReports>('B13', () => {
    const reports = getDemoState().feedback
      .filter((item) => (!filters.courseId || item.courseId === filters.courseId)
        && (!filters.sectionId || item.sectionId === filters.sectionId)
        && (!filters.status || item.status === filters.status)
        && (!filters.week || item.week === filters.week))
      .sort((a, b) => Date.parse(b.reportedAt) - Date.parse(a.reportedAt))
      .map((item) => ({
        reportId: item.reportId,
        type: item.type,
        typeLabel: item.typeLabel,
        reportedAt: item.reportedAt,
        week: item.week,
        sourcePage: item.sourcePage,
        student: item.student,
        studentSentence: item.studentSentence,
        aiCorrection: item.aiCorrection,
        aiExplanation: item.aiExplanation,
        comment: item.comment,
        status: item.status,
        resolution: item.resolution,
        correctedText: item.correctedText,
      }));
    const byType = new Map<string, number>();
    reports.forEach((item) => byType.set(item.typeLabel, (byType.get(item.typeLabel) ?? 0) + 1));
    return {
      counts: {
        open: reports.filter((item) => item.status === 'OPEN').length,
        resolved: reports.filter((item) => item.status === 'RESOLVED').length,
      },
      reports,
      quality: {
        reportRate: 0.8,
        reportCount: reports.length,
        correctionCount: 386,
        byType: [...byType].map(([typeLabel, count]) => ({ typeLabel, count })),
      },
    };
  });
}

/** B14 PATCH /prof/feedback-reports/{reportId} — Bearer(교수만) */
export function resolveFeedbackReport(reportId: number, input: { resolution: 'AI_CORRECT' | 'AI_ERROR' | 'CUSTOM'; correctedText?: string; explanation?: string }) {
  return mockRequest('B14', () => {
    if (input.resolution === 'CUSTOM' && !input.correctedText) fail(400, 'INVALID_INPUT', '올바른 교정 문장을 입력해 주세요.');
    const found = getDemoState().feedback.find((item) => item.reportId === reportId);
    if (!found || found.status === 'RESOLVED') fail(409, 'ALREADY_RESOLVED', '이미 처리된 신고예요.');
    updateDemoState((state) => ({ ...state, feedback: state.feedback.map((item) => item.reportId === reportId ? { ...item, status: 'RESOLVED', resolution: input.resolution, correctedText: input.resolution === 'CUSTOM' ? input.correctedText : undefined, aiCorrection: input.resolution === 'CUSTOM' ? input.correctedText ?? item.aiCorrection : item.aiCorrection, aiExplanation: input.explanation ?? item.aiExplanation } : item) }));
    return { reportId, status: 'RESOLVED' as const, resolution: input.resolution };
  }, '신고를 처리했어요.');
}

/** B15 POST /prof/feedback-reports/{reportId}/reopen — Bearer(교수만) */
export function reopenFeedbackReport(reportId: number) {
  return mockRequest('B15', () => {
    const found = getDemoState().feedback.find((item) => item.reportId === reportId);
    if (!found || found.status !== 'RESOLVED') fail(409, 'REPORT_NOT_RESOLVED', '아직 처리하지 않은 신고예요.');
    updateDemoState((state) => ({ ...state, feedback: state.feedback.map((item) => item.reportId === reportId ? { ...item, status: 'OPEN', resolution: undefined, correctedText: undefined } : item) }));
    return { reportId, status: 'OPEN' as const, resolution: null };
  }, '신고 처리를 되돌렸어요.');
}
