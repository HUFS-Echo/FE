import type { ScopeStatus } from '../api/types';

export type StatusLanguage = 'ko' | 'en';
export type FeedbackResolution = 'AI_CORRECT' | 'AI_ERROR' | 'CUSTOM';

const labels: Record<ScopeStatus, Record<StatusLanguage, string>> = {
  DONE: { ko: '종료', en: 'Done' },
  IN_PROGRESS: { ko: '진행 중', en: 'In progress' },
  SCHEDULED: { ko: '예약', en: 'Scheduled' },
  DRAFT: { ko: '임시 저장', en: 'Draft' },
  LOCKED: { ko: '미공개', en: 'Locked' },
};

export function getScopeStatusLabel(status: ScopeStatus | null, language: StatusLanguage): string {
  if (status == null) return language === 'en' ? 'Not set' : '미설정';
  return labels[status][language];
}

export function getFeedbackResolutionLabel(
  resolution: FeedbackResolution | undefined,
  correctedText: string | undefined,
  language: StatusLanguage,
): { label: string; correctedText?: string } {
  if (resolution === 'AI_CORRECT') {
    return { label: language === 'en' ? 'Resolved · AI correction confirmed' : '처리 완료 · AI 교정 확인' };
  }
  if (resolution === 'AI_ERROR') {
    return { label: language === 'en' ? 'Resolved · AI error confirmed' : '처리 완료 · AI 오류 확인' };
  }
  if (resolution === 'CUSTOM') {
    return {
      label: language === 'en' ? 'Resolved · Corrected · ' : '처리 완료 · 직접 교정 · ',
      correctedText,
    };
  }
  return { label: language === 'en' ? 'Resolved' : '처리 완료' };
}
