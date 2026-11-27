import { mockRequest, fail } from './client';
import { SUBJECTS, WEEK, WEEKS, type SubjectId } from '../config/learning';
import { getDemoState, updateDemoState } from '../lib/demoStore';
import type { HomeResponse, StudentCourses, WeeksResponse } from './types';
import { DEMO_WEEK_DATES } from './mockDate';
const courses = () => SUBJECTS.map((subject, index) => {
  const disabled = (getDemoState().studentSettings.disabledCourseIds as number[] | undefined) ?? [];
  return { courseId: index + 1, title: subject.name, type: (['GRAMMAR', 'WRITING', 'SPEAKING'] as const)[index], typeLabel: subject.type, code: subject.course === 'PT-READ1' ? 'PT-WRITE1' : subject.course, professorName: '김교수', section: '01분반', currentScopeTitle: subject.rangeTitle, enrolled: !disabled.includes(index + 1) };
});
/** A12 GET /student/courses — Bearer(학생만) */
export function getStudentCourses() { return mockRequest<StudentCourses>('A12', () => ({ language: 'PT', level: 'A1', courses: courses() })); }
/** A13 DELETE /student/courses/{courseId} — Bearer(학생만) */
export function leaveCourse(courseId: number) { return mockRequest<null>('A13', () => { const course = courses().find((item) => item.courseId === courseId); if (!course) fail(404, 'COURSE_NOT_FOUND', '과목을 찾을 수 없어요.'); if (!course.enrolled) fail(409, 'COURSE_NOT_ENROLLED', '이미 연결 해제된 과목이에요.'); const disabled = (getDemoState().studentSettings.disabledCourseIds as number[] | undefined) ?? []; updateDemoState((state) => ({ ...state, studentSettings: { ...state.studentSettings, disabledCourseIds: [...new Set([...disabled, courseId])] } })); return null; }, '과목에서 나갔어요.'); }
/** B1 GET /student/courses/{courseId}/home — Bearer(학생만) */
export function getCourseHome(courseId: number) { return mockRequest<HomeResponse>('B1', () => {
  const course = courses().find((item) => item.courseId === courseId && item.enrolled);
  if (!course) fail(403, 'COURSE_NOT_ENROLLED', '연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.');
  const subject = SUBJECTS[courseId - 1];
  return { week: WEEK.no, level: 'A1', greeting: { word: 'Olá', meaning: '안녕하세요' }, course: { courseId, title: course.title, typeLabel: course.typeLabel }, scope: { scopeId: courseId, title: subject.rangeTitle, pdfPages: subject.pdf, dueDate: subject.deadline }, practice: { type: course.type, targetId: WEEK.no * 10 + courseId } };
}); }
/** B2 GET /student/courses/{courseId}/weeks — Bearer(학생만) */
export function getCourseWeeks(courseId: number) { return mockRequest<WeeksResponse>('B2', () => {
  const course = courses().find((item) => item.courseId === courseId && item.enrolled);
  if (!course) fail(403, 'COURSE_NOT_ENROLLED', '연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.');
  return { courseTitle: 'PORTUGUÊS A1', totalWeeks: WEEKS.length, currentWeek: WEEK.no, weeks: WEEKS.map((week) => ({ week: week.no, scopeId: week.no, title: week.range, startDate: DEMO_WEEK_DATES[week.no].startDate, endDate: DEMO_WEEK_DATES[week.no].endDate, pdfPages: week.pdf.replace(/^PDF /, ''), status: week.status === 'done' ? 'DONE' : week.status === 'active' ? 'IN_PROGRESS' : 'LOCKED', participation: week.participation, accuracy: week.accuracy, opensAt: week.openAt })) };
}); }
export function getCourseIdFromLegacySubject(subject: SubjectId | 'reading') { return subject === 'reading' || subject === 'grammar' ? 1 : subject === 'writing' ? 2 : 3; }
