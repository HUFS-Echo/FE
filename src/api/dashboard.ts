import { mockRequest } from './client';
import type { ApiQuery, Dashboard } from './types';
/** B12 GET /prof/dashboard?courseId=&sectionId=&week= — Bearer(교수만) */
const studentsByCourse = {
  1: [
    ['김*윤','2025****11',78,12,34,'관사·전치사','2026-11-26T10:42:00'],
    ['박*은','2024****28',64,9,31,'주어 생략','2026-11-26T09:18:00'],
    ['이*아','2025****04',52,7,29,'관사','2026-11-25T16:05:00'],
    ['최*민','2024****56',41,6,18,'형용사 성 일치','2026-11-25T14:32:00'],
    ['정*서','2025****72',88,14,12,'전치사','2026-11-20T10:00:00'],
  ],
  2: [
    ['김*윤','2025****11',74,10,29,'과거형 시제','2026-11-26T10:28:00'],
    ['박*은','2024****28',69,8,24,'문장 연결','2026-11-26T09:06:00'],
    ['이*아','2025****04',58,7,27,'형용사 성·수 일치','2026-11-25T16:21:00'],
    ['최*민','2024****56',46,5,19,'어순','2026-11-25T14:10:00'],
    ['정*서','2025****72',81,11,15,'과거형 동사','2026-11-20T10:00:00'],
  ],
  3: [
    ['김*윤','2025****11',71,11,26,'정중한 주문 표현','2026-11-26T10:36:00'],
    ['박*은','2024****28',62,8,32,'가격 질문','2026-11-26T09:12:00'],
    ['이*아','2025****04',55,7,23,'발음·강세','2026-11-25T16:42:00'],
    ['최*민','2024****56',43,6,21,'응답 이어가기','2026-11-25T14:47:00'],
    ['정*서','2025****72',84,13,14,'관사 선택','2026-11-20T10:00:00'],
  ],
} as const;
export function getDashboard(filters: ApiQuery = {}) {
  const courseId = Number(filters.courseId ?? 1) as 1 | 2 | 3;
  const sectionId = Number(filters.sectionId ?? 1);
  const students = sectionId === 1 ? studentsByCourse[courseId] ?? studentsByCourse[1] : [];
  return mockRequest<Dashboard>('B12', () => ({
    courseTitle: courseId === 2 ? '포르투갈어 읽기와 쓰기' : courseId === 3 ? '포르투갈어 회화' : '포르투갈어 문법',
    section: `${String(sectionId).padStart(2, '0')}분반`, week: filters.week ?? 3,
    startDate: '2026-11-17', endDate: '2026-11-23', studentCount: sectionId === 1 ? 48 : 32,
    kpi: { activeStudents: 41, avgProgress: 64, avgErrorRate: 22, openReports: 2 },
    students: students.map(([maskedName, maskedStudentNo, progress, practiceCount, errorRate, mainError, lastActiveAt], index) => ({ studentId: 101 + index, maskedName, maskedStudentNo, progress, practiceCount, errorRate, mainError, lastActiveAt })),
  }));
}
