import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { SubjectId } from '../../../config/learning';
import type { Course, CourseType } from '../../../api/types';
import { getStudentCourses } from '../../../api/studentCourses';
import { useApi, ApiEmptyState, ApiLoadingState } from '../../../api/useApi';

type Props = { subject: SubjectId; variant: 'header' | 'sidebar'; onChange: (subject: SubjectId) => void };
const subjectForType: Record<CourseType, SubjectId> = { GRAMMAR: 'grammar', WRITING: 'writing', SPEAKING: 'speaking' };
const fallback: Record<SubjectId, Pick<Course, 'courseId' | 'title' | 'type' | 'typeLabel' | 'code' | 'enrolled'>> = {
  grammar: { courseId: 1, title: '포르투갈어 문법', type: 'GRAMMAR', typeLabel: '문법', code: 'PT-GRAM1', enrolled: true },
  writing: { courseId: 2, title: '포르투갈어 읽기와 쓰기', type: 'WRITING', typeLabel: '작문·교정', code: 'PT-WRITE1', enrolled: true },
  speaking: { courseId: 3, title: '포르투갈어 회화', type: 'SPEAKING', typeLabel: '말하기', code: 'PT-TALK1', enrolled: true },
};
const toneFor: Record<SubjectId, string> = { grammar: 'blue', writing: 'amber', speaking: 'mint' };

export function StudentCoursePicker({ subject, variant, onChange }: Props) {
  const coursesApi = useApi(() => getStudentCourses(), []);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const courses = coursesApi.data?.courses ?? [];
  const menuCourses: Course[] = coursesApi.error ? Object.values(fallback) : courses;
  const current = courses.find((course) => subjectForType[course.type] === subject) ?? fallback[subject];
  const currentSubject = subjectForType[current.type];

  useEffect(() => {
    const refreshCourses = () => coursesApi.retry();
    window.addEventListener('hufs-demo-change', refreshCourses);
    return () => window.removeEventListener('hufs-demo-change', refreshCourses);
  }, [coursesApi.retry]);
  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
    if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const options = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[data-course-option]:not(:disabled)') ?? []);
    if (!options.length) return;
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : event.key === 'ArrowDown' ? (index + 1) % options.length : index <= 0 ? options.length - 1 : index - 1;
    event.preventDefault(); options[nextIndex].focus();
  }
  function choose(nextSubject: SubjectId) { setOpen(false); if (nextSubject !== subject) onChange(nextSubject); }
  const tone = toneFor[currentSubject];
  return <div ref={rootRef} className={`student-course-picker student-course-picker--${variant}${open ? ' is-open' : ''}${variant === 'sidebar' ? ' side-course' : ''}`} onKeyDown={handleKeyDown}>
    {variant === 'sidebar' && <span className={`side-course__mark student-course-picker__icon--${tone}`} aria-hidden="true"><SubjectIcon subject={currentSubject} /></span>}
    <button ref={triggerRef} type="button" className="student-course-picker__trigger" aria-label={`현재 과목: ${current.title}. 과목 선택`} aria-expanded={open} aria-haspopup="menu" aria-controls={menuId} onClick={() => setOpen((value) => !value)}>
      {variant === 'header' && <span className={`student-course-picker__header-icon student-course-picker__icon--${tone}`} aria-hidden="true"><SubjectIcon subject={currentSubject} /></span>}
      <span className="student-course-picker__current">{variant === 'sidebar' ? <><span className="side-course__eyebrow">COURSE · 3주차</span><b>{current.title}</b><small>{current.typeLabel} · A1</small></> : <><small>현재 과목</small><b>{current.title}</b></>}</span><ChevronIcon />
    </button>
    {open && <div ref={menuRef} id={menuId} className="student-course-picker__menu" role="menu" aria-label="과목 선택">
      <div className="student-course-picker__menu-head"><span>학습 과목</span><small>PORTUGUÊS · A1</small></div>
      {coursesApi.loading && !coursesApi.error ? <ApiLoadingState label="과목을 불러오는 중…" /> : menuCourses.length === 0 ? <ApiEmptyState message="연결된 과목이 없어요." /> : <div className="student-course-picker__options">{menuCourses.map((course) => {
        const itemSubject = subjectForType[course.type];
        const selected = itemSubject === subject;
        const disabled = !course.enrolled;
        return <button key={course.courseId} type="button" role="menuitemradio" aria-checked={selected} aria-label={`${course.title}, ${course.typeLabel}${disabled ? ', 연결 해제됨' : ''}`} data-course-option disabled={disabled} className={`student-course-picker__option${selected ? ' is-selected' : ''}`} onClick={() => choose(itemSubject)}>
          <span className={`student-course-picker__option-icon student-course-picker__option-icon--${toneFor[itemSubject]}`} aria-hidden="true"><SubjectIcon subject={itemSubject} /></span><span className="student-course-picker__option-copy"><b>{course.title}</b><small>{course.typeLabel} · {course.code}</small></span>{selected ? <CheckIcon /> : disabled ? <span className="student-course-picker__locked">연결 필요</span> : <ArrowIcon />}
        </button>;
      })}</div>}
      <p className="student-course-picker__hint">선택하면 해당 과목 홈으로 이동합니다.</p>
    </div>}
  </div>;
}

function SubjectIcon({ subject }: { subject: SubjectId }) {
  if (subject === 'grammar') return <svg viewBox="0 0 20 20"><text x="10" y="13.8" textAnchor="middle" fill="currentColor" fontFamily="Georgia, serif" fontSize="11" fontWeight="700">Aa</text><path d="M4 16.5h12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>;
  if (subject === 'writing') return <svg viewBox="0 0 20 20"><path d="m4 14.8 9.7-9.7 2.2 2.2-9.7 9.7L3.5 17z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /><path d="m12.4 6.4 2.2 2.2M4.2 14.7l2.2 2.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 20 20"><path d="M3.5 4.5h13v9H9l-4.5 3v-3H3.5z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6.5 8h7M6.5 10.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>;
}
function ChevronIcon() { return <svg className="student-course-picker__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CheckIcon() { return <svg className="student-course-picker__check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.2 3 3 6-6.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ArrowIcon() { return <svg className="student-course-picker__arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
