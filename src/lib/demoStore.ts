import type { ExerciseType, FeedbackReportType, Question, ScopeStatus } from '../api/types';

export type FeedbackCase = {
  reportId: number; courseId: number; sectionId: number; type: FeedbackReportType; typeLabel: string; reportedAt: string; week: number; sourcePage: number;
  student: { maskedName: string; maskedStudentNo: string }; studentSentence: string; aiCorrection: string; aiExplanation: string;
  comment: string; status: 'OPEN' | 'RESOLVED'; resolution?: 'AI_CORRECT' | 'AI_ERROR' | 'CUSTOM'; correctedText?: string;
};
export type LearningScope = {
  scopeId: number; courseId: number; sectionId: number; week: number; materialId: number; startPage: number; endPage: number;
  startDate: string; endDate: string; pdfPages: string; title: string; exerciseType: ExerciseType; questions: Question[];
  status: ScopeStatus; participants: number | null; accuracy: number | null; updatedAt: string;
};
export type DemoState = {
  scopes: LearningScope[];
  feedback: FeedbackCase[];
  scopeDraft: Record<string, unknown> | null;
  studentSettings: Record<string, unknown>;
  professorSettings: Record<string, unknown>;
};
const KEY = 'hufs-echo-demo-v2';
const courseName = (courseId: number) => ['포르투갈어 문법', '포르투갈어 읽기와 쓰기', '포르투갈어 회화'][courseId - 1] ?? '포르투갈어 문법';
const legacyCourseId = (value: unknown): number => typeof value === 'number' && value >= 1 && value <= 3 ? value : typeof value === 'string' && value.includes('읽기와 쓰기') ? 2 : typeof value === 'string' && value.includes('회화') ? 3 : 1;
const feedbackType = (label: unknown): FeedbackReportType => label === '과잉 교정' ? 'OVER_CORRECTION' : label === '문법 용어 혼동' ? 'TERM_CONFUSION' : label === '잘못된 교정' ? 'WRONG_CORRECTION' : 'OTHER';
const initialFeedback: FeedbackCase[] = [
  { reportId: 1, courseId: 1, sectionId: 1, type: 'OVER_CORRECTION', typeLabel: '과잉 교정', reportedAt: '2026-11-21T10:42:00', week: 3, sourcePage: 29, student: { maskedName: '김*윤', maskedStudentNo: '2025****11' }, studentSentence: 'Eu estou cansada.', aiCorrection: 'Eu sou cansada.', aiExplanation: 'estar를 ser로 바꾸는 편이 자연스럽습니다.', comment: '맞게 쓴 것 같은데 틀렸다고 나왔어요.', status: 'OPEN' },
    { reportId: 2, courseId: 1, sectionId: 1, type: 'TERM_CONFUSION', typeLabel: '문법 용어 혼동', reportedAt: '2026-11-20T16:05:00', week: 3, sourcePage: 30, student: { maskedName: '이*아', maskedStudentNo: '2025****04' }, studentSentence: 'A conta, por favor.', aiCorrection: 'a는 부정관사입니다.', aiExplanation: 'a는 부정관사로 쓰입니다.', comment: 'a는 정관사 아닌가요?', status: 'OPEN' },
];
const question = (questionId: number, sentence: string, answer: string, sourcePage: number): Question => ({ questionId, format: 'MULTIPLE_CHOICE', sentence, answer, choices: [], sourcePage, answerType: 'CHOICE' });
const initial: DemoState = {
  scopes: [
    { scopeId: 1, courseId: 1, sectionId: 1, week: 1, materialId: 1, startPage: 8, endPage: 12, startDate: '2026-11-03', endDate: '2026-11-09', pdfPages: '8–12', title: '인사와 자기소개', exerciseType: 'GRAMMAR', questions: [], status: 'DONE', participants: 44, accuracy: 88, updatedAt: '2026-11-09T09:00:00Z' },
    { scopeId: 2, courseId: 2, sectionId: 1, week: 2, materialId: 1, startPage: 18, endPage: 22, startDate: '2026-11-10', endDate: '2026-11-16', pdfPages: '18–22', title: '길 묻고 답하기', exerciseType: 'READING_WRITING', questions: [], status: 'DONE', participants: 42, accuracy: 82, updatedAt: '2026-11-16T09:00:00Z' },
    { scopeId: 3, courseId: 1, sectionId: 1, week: 3, materialId: 1, startPage: 29, endPage: 30, startDate: '2026-11-17', endDate: '2026-11-23', pdfPages: '29–30', title: '부정관사와 명사의 성·수 일치', exerciseType: 'GRAMMAR', questions: [], status: 'IN_PROGRESS', participants: 41, accuracy: 78, updatedAt: '2026-11-17T09:00:00Z' },
    { scopeId: 4, courseId: 3, sectionId: 1, week: 4, materialId: 1, startPage: 38, endPage: 42, startDate: '2026-11-24', endDate: '2026-11-30', pdfPages: '38–42', title: '시장에서 가격 묻기', exerciseType: 'SPEAKING', questions: [], status: 'SCHEDULED', participants: null, accuracy: null, updatedAt: '2026-11-17T09:00:00Z' },
    { scopeId: 5, courseId: 2, sectionId: 1, week: 5, materialId: 1, startPage: 52, endPage: 58, startDate: '2026-12-01', endDate: '2026-12-07', pdfPages: '52–58', title: '리스본 여행', exerciseType: 'READING_WRITING', questions: [], status: 'DRAFT', participants: null, accuracy: null, updatedAt: '2026-11-17T09:00:00Z' },
  ],
  feedback: initialFeedback, scopeDraft: null,
  studentSettings: { goal: 10, detail: 'detailed', translation: true, voice: false, outsideWords: true, notifications: { newScope: true, dueTomorrow: true, weeklyReportMail: false }, consent: { agreed: true, agreedAt: '2026-11-17' }, disabledCourseIds: [] },
  professorSettings: { strictness: '보통', language: '한국어', outsideWords: false, hideStudent: true, acceptStudents: true, glossary: [{ term: '정관사', desc: 'o/a' }, { term: '부정관사', desc: 'um/uma' }] },
};
function migrateScope(value: any, index: number): LearningScope {
  const courseId = legacyCourseId(value.courseId ?? value.subject);
  const startPage = Number(value.startPage ?? String(value.pages ?? '').split(/[–-]/)[0]) || 1;
  const endPage = Number(value.endPage ?? String(value.pages ?? '').split(/[–-]/)[1]) || startPage;
  const oldStatus = value.status;
  const status: ScopeStatus = oldStatus === 'ended' ? 'DONE' : oldStatus === 'active' ? 'IN_PROGRESS' : oldStatus === 'scheduled' ? 'SCHEDULED' : ['DONE','IN_PROGRESS','SCHEDULED','DRAFT','LOCKED'].includes(oldStatus) ? oldStatus : 'DRAFT';
  const questions: Question[] = Array.isArray(value.questions) ? value.questions : (Array.isArray(value.exercises) ? value.exercises : []).map((item: any, i: number) => question(i + 1, item.prompt ?? item.sentence ?? '', item.answer ?? '', item.page ?? item.sourcePage ?? startPage));
  const scopeId = Number(value.scopeId ?? String(value.id ?? `s${index + 1}`).replace(/\D/g, '')) || index + 1;
  const normalizedStatus: ScopeStatus = scopeId === 5 && courseId === 2 && Number(value.week) === 5 && value.updatedAt === '2026-11-17T09:00:00Z' && status === 'SCHEDULED' ? 'DRAFT' : status;
  const sectionId = Number(value.sectionId ?? value.section ?? 1) || 1;
  const rawParticipants = value.participants == null && value.participation == null ? null : Number(value.participants ?? value.participation);
  const sectionSize = sectionId === 1 ? 48 : 32;
  const participants = ['DRAFT', 'SCHEDULED', 'LOCKED'].includes(normalizedStatus) ? null : rawParticipants == null ? 0 : rawParticipants > sectionSize ? Math.round(sectionSize * rawParticipants / 100) : rawParticipants;
  const accuracy = ['DRAFT', 'SCHEDULED', 'LOCKED'].includes(normalizedStatus) ? null : value.accuracy == null ? 0 : Number(value.accuracy);
  return { scopeId, courseId, sectionId, week: Number(value.week) || 1, materialId: Number(value.materialId) || 1, startPage, endPage, startDate: value.startDate ?? '2026-11-17', endDate: value.endDate ?? '2026-11-23', pdfPages: value.pdfPages ?? value.pages ?? `${startPage}–${endPage}`, title: value.title ?? value.topic ?? courseName(courseId), exerciseType: value.exerciseType ?? (courseId === 1 ? 'GRAMMAR' : courseId === 2 ? 'READING_WRITING' : 'SPEAKING'), questions, status: normalizedStatus, participants, accuracy, updatedAt: value.updatedAt ?? '2026-11-17T09:00:00Z' };
}
function migrateFeedback(value: any, index: number): FeedbackCase {
  const typeLabel = value.typeLabel ?? value.type ?? '기타';
  return { reportId: Number(value.reportId ?? String(value.id ?? index + 1).replace(/\D/g, '')) || index + 1, courseId: legacyCourseId(value.courseId ?? value.subject), sectionId: Number(value.sectionId ?? value.section ?? 1) || 1, type: value.type in { OVER_CORRECTION: 1, TERM_CONFUSION: 1, WRONG_CORRECTION: 1, OTHER: 1 } ? value.type : feedbackType(typeLabel), typeLabel, reportedAt: value.reportedAt ?? '2026-11-21T10:42:00', week: Number(value.week ?? String(value.weekLabel ?? '').replace(/\D/g, '')) || 3, sourcePage: Number(value.sourcePage ?? String(value.page ?? '').replace(/\D/g, '')) || 29, student: value.student && typeof value.student === 'object' ? value.student : { maskedName: String(value.student ?? '').split(' · ')[0] || '학생', maskedStudentNo: String(value.student ?? '').split(' · ')[1] ?? '' }, studentSentence: value.studentSentence ?? value.original ?? '', aiCorrection: value.aiCorrection ?? value.correction ?? '', aiExplanation: value.aiExplanation ?? value.explanation ?? '', comment: value.comment ?? '', status: value.status === 'RESOLVED' || value.status === 'resolved' ? 'RESOLVED' : 'OPEN', resolution: value.resolution, correctedText: value.correctedText };
}
export function getDemoState(): DemoState {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<DemoState> & { scopes?: any[]; feedback?: any[] } | null;
    if (!stored) return structuredClone(initial);
    const storedSettings = (stored.studentSettings ?? {}) as Record<string, any>;
    const oldNotifications = (storedSettings.notifications ?? {}) as Record<string, boolean>;
    const settings: Record<string, any> = {
      ...initial.studentSettings,
      ...storedSettings,
      notifications: { ...(initial.studentSettings.notifications as object), ...oldNotifications, newScope: oldNotifications.newScope ?? oldNotifications.release ?? true, dueTomorrow: oldNotifications.dueTomorrow ?? oldNotifications.deadline ?? true },
      consent: { ...(initial.studentSettings.consent as object), ...(storedSettings.consent ?? {}) },
    };
    const legacyDisabled = Array.isArray(settings.disabledCourses) ? settings.disabledCourses.map((item: unknown) => legacyCourseId(item)) : [];
    const disabledCourseIds = [...new Set([...(Array.isArray(settings.disabledCourseIds) ? settings.disabledCourseIds.filter((item): item is number => typeof item === 'number') : []), ...legacyDisabled])];
    const next: DemoState = { ...initial, ...stored, scopes: (stored.scopes ?? initial.scopes).map(migrateScope), feedback: (stored.feedback ?? initial.feedback).filter((item: any) => !(item.studentSentence === 'Queria um café, por favor.' || item.original === 'Queria um café, por favor.')).map(migrateFeedback), studentSettings: { ...settings, disabledCourseIds }, professorSettings: { ...initial.professorSettings, ...stored.professorSettings } };
    return next;
  } catch { return structuredClone(initial); }
}
export function updateDemoState(update: (state: DemoState) => DemoState) {
  const next = update(getDemoState());
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('hufs-demo-change'));
  return next;
}
export function resetDemoState() { localStorage.removeItem(KEY); localStorage.removeItem('hufs-echo.prof-filters.v1'); window.dispatchEvent(new Event('hufs-demo-change')); return structuredClone(initial); }
