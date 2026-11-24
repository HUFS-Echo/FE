export type FeedbackCase = {
  id: string; type: string; date: string; week: string; page: string; student: string; subject: 'reading' | 'writing' | 'speaking';
  original: string; correction: string; explanation: string; comment: string;
  status: 'open' | 'resolved'; resolution?: string; correctAnswer?: string;
};
export type LearningScope = {
  id: string; subject: string; week: number; dates: string; pages: string; topic: string;
  section?: '01' | '02'; status: 'ended' | 'active' | 'scheduled' | 'draft' | 'private'; previousStatus?: 'ended' | 'active' | 'scheduled' | 'draft'; participation: number; accuracy: number;
  exercises: Array<{ id: string; prompt: string; answer: string; explanation: string; page: number }>;
};
export type DemoState = {
  scopes: LearningScope[];
  feedback: FeedbackCase[];
  scopeDraft: Record<string, unknown> | null;
  studentSettings: Record<string, unknown>;
  professorSettings: Record<string, unknown>;
};
const KEY = 'hufs-echo-demo-v2';
const initialFeedback: FeedbackCase[] = [
  { id: 'f1', type: '과잉 교정', date: '11.21 10:42', week: '3주차', page: '29쪽', student: '김*윤 · 2025****11', subject: 'reading', original: 'Eu estou cansada.', correction: 'Eu sou cansada.', explanation: 'estar를 ser로 바꾸는 편이 자연스럽습니다.', comment: '맞게 쓴 것 같은데 틀렸다고 나왔어요.', status: 'open' },
  { id: 'f2', type: '과잉 교정', date: '11.21 09:18', week: '3주차', page: '48쪽', student: '박*은 · 2024****28', subject: 'speaking', original: 'Queria um café, por favor.', correction: 'Eu queria um café, por favor.', explanation: '완전한 문장에는 주어가 필요합니다.', comment: '주어는 생략해도 된다고 배웠어요.', status: 'open' },
  { id: 'f3', type: '문법 용어 혼동', date: '11.20 16:05', week: '3주차', page: '30쪽', student: '이*아 · 2025****04', subject: 'reading', original: 'A conta, por favor.', correction: 'a는 부정관사입니다.', explanation: 'a는 부정관사로 쓰입니다.', comment: 'a는 정관사 아닌가요?', status: 'open' },
];
const initial: DemoState = {
  scopes: [
    { id: 's1', section: '01', subject: '포르투갈어 문법', week: 1, dates: '11.03–11.09', pages: '8–12', topic: '인사와 자기소개', status: 'ended', participation: 92, accuracy: 88, exercises: [] },
    { id: 's2', section: '01', subject: '포르투갈어 읽기와 쓰기', week: 2, dates: '11.10–11.16', pages: '18–22', topic: '길 묻고 답하기', status: 'ended', participation: 88, accuracy: 82, exercises: [] },
    { id: 's3', section: '01', subject: '포르투갈어 문법', week: 3, dates: '11.17–11.23', pages: '29–30', topic: '부정관사와 명사의 성·수 일치', status: 'active', participation: 85, accuracy: 78, exercises: [] },
    { id: 's4', section: '01', subject: '포르투갈어 회화', week: 4, dates: '11.24–11.30', pages: '38–42', topic: '시장에서 가격 묻기', status: 'scheduled', participation: 0, accuracy: 0, exercises: [] },
    { id: 's5', section: '01', subject: '포르투갈어 읽기와 쓰기', week: 5, dates: '12.01–12.07', pages: '52–58', topic: '리스본 여행', status: 'draft', participation: 0, accuracy: 0, exercises: [] },
  ],
  feedback: initialFeedback, scopeDraft: null,
  studentSettings: { goal: 10, detail: 'detailed', translation: true, voice: false, outsideWords: true, notifications: { release: true, deadline: true, report: false } },
  professorSettings: { strictness: '보통', language: '한국어', outsideWords: false, hideStudent: true, acceptStudents: true, glossary: [{ term: '정관사', desc: 'o/a' }, { term: '부정관사', desc: 'um/uma' }] },
};
export function getDemoState(): DemoState {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<DemoState> | null;
    const state = stored ? { ...initial, ...stored, feedback: stored.feedback ?? initial.feedback, scopes: stored.scopes ?? initial.scopes } : structuredClone(initial);
    const migrateSubject = (subject: unknown) => subject === '읽기와 쓰기' ? '포르투갈어 문법'
      : subject === '작문' ? '포르투갈어 읽기와 쓰기'
        : subject === '회화' ? '포르투갈어 회화' : subject;
    const disabled = Array.isArray(state.studentSettings.disabledCourses)
      ? state.studentSettings.disabledCourses.map((name) => name === '읽기와 쓰기' ? '포르투갈어 문법'
        : name === '작문' ? '포르투갈어 읽기와 쓰기'
          : name === '회화' ? '포르투갈어 회화' : name)
      : [];
    const storedCourseCodes = state.professorSettings.courseCodes;
    const migratedCourseCodes = storedCourseCodes && typeof storedCourseCodes === 'object'
      ? { ...(storedCourseCodes as Record<string, string>) }
      : null;
    if (migratedCourseCodes?.['PT-READ1']) {
      if (!migratedCourseCodes['PT-GRAM1']) migratedCourseCodes['PT-GRAM1'] = migratedCourseCodes['PT-READ1'];
      delete migratedCourseCodes['PT-READ1'];
    }
    const professorSettings = migratedCourseCodes
      ? { ...state.professorSettings, courseCodes: migratedCourseCodes }
      : state.professorSettings;
    return {
      ...state,
      scopes: state.scopes.map((scope) => ({ ...scope, subject: String(migrateSubject(scope.subject)) })),
      scopeDraft: state.scopeDraft
        ? { ...state.scopeDraft, subject: migrateSubject(state.scopeDraft.subject) }
        : null,
      studentSettings: { ...state.studentSettings, disabledCourses: disabled },
      professorSettings,
    };
  } catch { return structuredClone(initial); }
}
export function updateDemoState(update: (state: DemoState) => DemoState) {
  const next = update(getDemoState());
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('hufs-demo-change'));
  return next;
}
export function resetDemoState() { localStorage.removeItem(KEY); localStorage.removeItem('hufs-echo.prof-filters.v1'); window.dispatchEvent(new Event('hufs-demo-change')); return structuredClone(initial); }
