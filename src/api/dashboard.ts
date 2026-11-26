import { mockRequest } from './client';
import type { ApiQuery, Dashboard } from './types';
/** B12 GET /prof/dashboard?courseId=&sectionId=&week= — Bearer(교수만) */
export function getDashboard(filters: ApiQuery = {}) { return mockRequest<Dashboard>('B12', () => ({ courseTitle: filters.courseId === 2 ? '포르투갈어 읽기와 쓰기' : filters.courseId === 3 ? '포르투갈어 회화' : '포르투갈어 문법', section: `${String(filters.sectionId ?? 1).padStart(2, '0')}분반`, week: filters.week ?? 3, startDate: '2026-11-17', endDate: '2026-11-23', studentCount: 48, kpi: { activeStudents: 41, avgProgress: 64, avgErrorRate: 22, openReports: 2 }, students: [{ studentId: 101, maskedName: '김*윤', maskedStudentNo: '2025****11', progress: 78, practiceCount: 12, errorRate: 34, mainError: '관사·전치사', lastActiveAt: '2026-11-23T10:42:00' }] })); }
