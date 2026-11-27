import { getDemoState } from '../lib/demoStore';
import { DEMO_WEEK_DATES } from './mockDate';
import { mockRequest, fail } from './client';
import type { ExerciseTypes, ProfCourses } from './types';
/** A14 GET /prof/courses — Bearer(교수만) */
export function getProfessorCourses() { return mockRequest<ProfCourses>('A14', () => {
  const { scopes } = getDemoState();
  const defaultStatuses = ['DONE', 'DONE', 'IN_PROGRESS', 'SCHEDULED', 'DRAFT'] as const;
  return { courses: [1, 2, 3].map((courseId) => {
    const storedScopes = scopes.filter((scope) => scope.courseId === courseId && scope.sectionId === 1);
    const weeks = Array.from({ length: 15 }, (_, index) => {
      const week = index + 1;
      const status = defaultStatuses[index] ?? null;
      const stored = storedScopes.find((scope) => scope.week === week);
      const dates = stored ?? DEMO_WEEK_DATES[week];
      return { week, status: stored?.status ?? status, startDate: dates.startDate, endDate: dates.endDate };
    });
    return { courseId, title: ['포르투갈어 문법', '포르투갈어 읽기와 쓰기', '포르투갈어 회화'][courseId - 1], type: (['GRAMMAR', 'WRITING', 'SPEAKING'] as const)[courseId - 1], typeLabel: ['문법·문제 풀이', '작문·교정', '말하기'][courseId - 1], sections: [{ sectionId: 1, name: '01분반', studentCount: 48, classCode: ['PT-GRAM1', 'PT-WRITE1', 'PT-TALK1'][courseId - 1] }, { sectionId: 2, name: '02분반', studentCount: 0, classCode: ['PT-GRAM1', 'PT-WRITE1', 'PT-TALK1'][courseId - 1] }], weeks };
  }), current: { courseId: 1, sectionId: 1, week: 3 } };
}); }
/** A15 GET /prof/exercise-types?courseId= — Bearer(교수만) */
export function getExerciseTypes(courseId: number): Promise<ExerciseTypes> { return mockRequest('A15', () => {
  if (![1, 2, 3].includes(courseId)) fail(404, 'COURSE_NOT_FOUND', '담당하지 않는 과목이에요.');
  return { types: [
    { type: 'GRAMMAR', label: '문법', recommended: courseId === 1, formats: [['FORM_WRITE', '형태 쓰기'], ['FILL_BLANK', '빈칸 채우기'], ['FIX_PART', '한 부분 고치기'], ['REWRITE', '문장 바꾸기'], ['MULTIPLE_CHOICE', '객관식']].map(([format, label]) => ({ format, label })) },
    { type: 'READING_WRITING', label: '작문·독해', recommended: courseId === 2, formats: [['FIND_INFO', '핵심 정보 찾기'], ['FIND_PURPOSE', '글의 목적 파악'], ['WRITE_REQUIRED', '필수 정보를 담아 쓰기'], ['REPLY', '읽고 답장 쓰기'], ['MULTIPLE_CHOICE', '객관식']].map(([format, label]) => ({ format, label })) },
    { type: 'SPEAKING', label: '회화', recommended: courseId === 3, formats: [['LISTEN', '듣고 이해하기'], ['REPLY_LINE', '응답 한 줄 쓰기'], ['SPEAK', '직접 말하기'], ['READ_ALOUD', '소리 내어 읽기'], ['MULTIPLE_CHOICE', '객관식']].map(([format, label]) => ({ format, label })) },
  ] as ExerciseTypes['types'] };
}); }
