import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { SUBJECTS, WEEK, getSubject, isCourseDisabled, type SubjectId } from '../../../config/learning';
import { getDemoState } from '../../../lib/demoStore';

type Props = {
  subject: SubjectId;
  variant: 'header' | 'sidebar';
  onChange: (subject: SubjectId) => void;
};

export function StudentCoursePicker({ subject, variant, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = getSubject(subject);
  const disabledCourses = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? [];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const options = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[data-course-option]:not(:disabled)') ?? []);
    if (!options.length) return;
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : event.key === 'ArrowDown'
          ? (index + 1) % options.length
          : index <= 0 ? options.length - 1 : index - 1;
    event.preventDefault();
    options[nextIndex].focus();
  }

  function choose(nextSubject: SubjectId) {
    setOpen(false);
    if (nextSubject !== subject) onChange(nextSubject);
  }

  return (
    <div
      ref={rootRef}
      className={`student-course-picker student-course-picker--${variant}${open ? ' is-open' : ''}${variant === 'sidebar' ? ' side-course' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {variant === 'sidebar' && (
        <span className="side-course__mark" aria-hidden="true">
          <BookIcon />
        </span>
      )}
      <button
        ref={triggerRef}
        type="button"
        className="student-course-picker__trigger"
        aria-label={`현재 과목: ${current.name}. 과목 선택`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {variant === 'header' && (
          <span className="student-course-picker__header-icon" aria-hidden="true">
            <BookIcon />
          </span>
        )}
        <span className="student-course-picker__current">
          {variant === 'sidebar' ? (
            <>
              <span className="side-course__eyebrow">COURSE · {WEEK.label}</span>
              <b>{current.name}</b>
              <small>{current.type} · A1</small>
            </>
          ) : (
            <>
              <small>현재 과목</small>
              <b>{current.name}</b>
            </>
          )}
        </span>
        <ChevronIcon />
      </button>

      {open && (
        <div ref={menuRef} id={menuId} className="student-course-picker__menu" role="menu" aria-label="과목 선택">
          <div className="student-course-picker__menu-head">
            <span>학습 과목</span>
            <small>PORTUGUÊS · A1</small>
          </div>
          <div className="student-course-picker__options">
            {SUBJECTS.map((item, index) => {
              const selected = item.id === subject;
              const disabled = isCourseDisabled(item.id, disabledCourses);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  aria-label={`${item.name}, ${item.type}${disabled ? ', 연결 해제됨' : ''}`}
                  data-course-option
                  disabled={disabled}
                  className={`student-course-picker__option${selected ? ' is-selected' : ''}`}
                  onClick={() => choose(item.id)}
                >
                  <span className={`student-course-picker__number student-course-picker__number--${item.tone}`} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="student-course-picker__option-copy">
                    <b>{item.name}</b>
                    <small>{item.type} · {item.course}</small>
                  </span>
                  {selected ? <CheckIcon /> : disabled ? <span className="student-course-picker__locked">연결 필요</span> : <ArrowIcon />}
                </button>
              );
            })}
          </div>
          <p className="student-course-picker__hint">선택하면 해당 과목 홈으로 이동합니다.</p>
        </div>
      )}
    </div>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20">
      <path d="M3.5 4.5h5.2c.8 0 1.3.5 1.3 1.2v9.8c0-.8-.6-1.3-1.4-1.3H3.5ZM16.5 4.5h-5.2c-.8 0-1.3.5-1.3 1.2v9.8c0-.8.6-1.3 1.4-1.3h5.1Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="student-course-picker__chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="student-course-picker__check" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3.5 8.2 3 3 6-6.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="student-course-picker__arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
