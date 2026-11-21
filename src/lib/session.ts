export type Role = 'student' | 'professor';

export type Session = {
  name: string;
  role: Role;
  studentId: string;
  department: string;
};

export const DEMO_STUDENT: Session = {
  name: '김하늘',
  role: 'student',
  studentId: '202503356',
  department: '포르투갈어과 · 2학년',
};

export const DEMO_PROFESSOR: Session = {
  name: '박민수',
  role: 'professor',
  studentId: 'prof-2024',
  department: '포르투갈어과 · 담당 교수',
};
