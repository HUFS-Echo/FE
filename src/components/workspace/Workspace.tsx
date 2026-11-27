import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '../Wordmark';
import { getProfessorCourses } from '../../api/profCourses';
import { ApiErrorState, ApiLoadingState, useApi } from '../../api/useApi';
import type { ProfCourses } from '../../api/types';
import { getScopeStatusLabel } from '../../lib/statusLabels';
import type { Session } from '../../lib/session';
import { roleHome } from '../../lib/router';
import { StudentShell } from './student/StudentShell';
import { ProfessorShell } from './professor/ProfessorShell';
import { ProfFilterProvider, defaultProfFilters, type ProfFilters } from './professor/ProfFilterContext';
import {
  ProfessorLanguageContext,
  translateProfessorText,
  type ProfessorLanguage,
} from './professor/ProfessorLanguageContext';

type Props = {
  session: Session;
  path: string;
  onNavigate: (path: string) => void;
  onSessionUpdate: (session: Session) => void;
  onLogout: () => void;
  onToast: (message: string) => void;
  onReset: () => void;
  onReplay: () => void;
};

function fromQuery(): Partial<ProfFilters> {
  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get('courseId'));
  const sectionId = Number(params.get('sectionId'));
  const week = Number(params.get('week'));
  return {
    ...(courseId >= 1 && courseId <= 3 ? { course: courseId === 1 ? 'grammar' : courseId === 2 ? 'writing' : 'speaking' } : {}),
    ...(sectionId === 1 || sectionId === 2 ? { section: String(sectionId).padStart(2, '0') as ProfFilters['section'] } : {}),
    ...(week > 0 ? { week } : {}),
  };
}
function initialFilters(): ProfFilters {
  try {
    const stored = JSON.parse(localStorage.getItem('hufs-echo.prof-filters.v1') || '{}') as Record<string, unknown>;
    const saved = { ...stored, course: stored.course === 'reading' ? 'grammar' : stored.course } as Partial<ProfFilters>;
    const query = window.location.pathname.startsWith('/prof') ? fromQuery() : {};
    return { ...defaultProfFilters, ...saved, ...query };
  } catch {
    return defaultProfFilters;
  }
}

function initialProfessorLanguage(): ProfessorLanguage {
  try {
    return localStorage.getItem('hufs-echo.professor-language.v1') === 'en' ? 'en' : 'ko';
  } catch {
    return 'ko';
  }
}

const languageOptions = [
  { value: 'ko', code: 'KO', label: '한국어', hint: 'Korean' },
  { value: 'en', code: 'EN', label: 'English', hint: 'English' },
] as const;

function ProfessorLanguagePicker({ language, label, onChange }: {
  language: ProfessorLanguage;
  label: string;
  onChange: (language: ProfessorLanguage) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = languageOptions.find(option => option.value === language) ?? languageOptions[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return <div className={`header-language ${open ? 'is-open' : ''}`} ref={rootRef}>
    <button ref={triggerRef} type="button" className="header-language__trigger"
      aria-label={`${label}: ${selected.label}`} aria-expanded={open} aria-controls="professor-language-menu"
      onClick={() => setOpen(value => !value)}>
      <span className="header-language__mark" aria-hidden="true">文</span>
      <span>{selected.label}</span>
      <svg className="header-language__chevron" viewBox="0 0 12 12" aria-hidden="true">
        <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && <div id="professor-language-menu" className="header-language__menu" role="group" aria-label={label}>
      <div className="header-language__menu-heading"><b>{label}</b><span>DISPLAY LANGUAGE</span></div>
      {languageOptions.map(option => <button key={option.value} type="button"
        className={`header-language__option ${language === option.value ? 'is-active' : ''}`}
        aria-pressed={language === option.value} onClick={() => { onChange(option.value); setOpen(false); }}>
        <span className="header-language__option-code" aria-hidden="true">{option.code}</span>
        <span className="header-language__option-copy"><b>{option.label}</b><small>{option.hint}</small></span>
        {language === option.value && <svg className="header-language__check" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m3.5 8.2 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
      </button>)}
    </div>}
  </div>;
}

export function Workspace({ session, path, onNavigate, onSessionUpdate, onLogout, onToast, onReset, onReplay }: Props) {
  const [filters, setFilters] = useState<ProfFilters>(initialFilters);
  const [professorLanguage, setProfessorLanguage] = useState<ProfessorLanguage>(initialProfessorLanguage);
  const isStudent = session.role === 'STUDENT';
  const professorCoursesApi = useApi<ProfCourses>(() => isStudent ? Promise.resolve({ courses: [], current: { courseId: 1, sectionId: 1, week: 3 } }) : getProfessorCourses(), [session.email, isStudent]);
  const displayLanguage: ProfessorLanguage = isStudent ? 'ko' : professorLanguage;
  const t = (text: string) => translateProfessorText(displayLanguage, text);

  useEffect(() => {
    if (isStudent || !path.startsWith('/prof') || !professorCoursesApi.data) return;
    if (Object.keys(fromQuery()).length) return;
    const current = professorCoursesApi.data.current;
    setFilters({ course: current.courseId === 2 ? 'writing' : current.courseId === 3 ? 'speaking' : 'grammar', section: String(current.sectionId).padStart(2, '0') as ProfFilters['section'], week: current.week });
  }, [isStudent, path, professorCoursesApi.data]);

  useEffect(() => {
    if (isStudent || !path.startsWith('/prof')) return;
    if (!professorCoursesApi.data && !professorCoursesApi.error) return;
    localStorage.setItem('hufs-echo.prof-filters.v1', JSON.stringify(filters));
    const params = new URLSearchParams(window.location.search);
    const courseId = filters.course === 'grammar' ? 1 : filters.course === 'writing' ? 2 : 3;
    params.set('courseId', String(courseId)); params.set('sectionId', filters.section === '01' ? '1' : '2'); params.set('week', String(filters.week));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [filters, isStudent, path, professorCoursesApi.data, professorCoursesApi.error]);

  useEffect(() => {
    if (isStudent || !path.startsWith('/prof')) return;
    const query = fromQuery();
    if (Object.keys(query).length) setFilters((current) => ({ ...current, ...query }));
  }, [path, isStudent]);

  const courseId = filters.course === 'grammar' ? 1 : filters.course === 'writing' ? 2 : 3;
  const selectedCourse = professorCoursesApi.data?.courses.find((course) => course.courseId === courseId);
  const weekSuffix = (weekNumber: number) => {
    const week = selectedCourse?.weeks.find((item) => item.week === weekNumber);
    if (!week) return '';
    if (week.status === 'IN_PROGRESS' && week.startDate && week.endDate) return `${week.startDate.slice(5).replace('-', '.')} – ${week.endDate.slice(5).replace('-', '.')}`;
    return getScopeStatusLabel(week.status, displayLanguage);
  };

  useEffect(() => {
    try {
      localStorage.setItem('hufs-echo.professor-language.v1', professorLanguage);
    } catch {
      // Language switching still works for this session if storage is unavailable.
    }
  }, [professorLanguage]);

  useEffect(() => {
    const resetFilters = () => {
      if (!localStorage.getItem('hufs-echo.prof-filters.v1')) setFilters(defaultProfFilters);
      professorCoursesApi.retry();
    };
    window.addEventListener('hufs-demo-change', resetFilters);
    return () => window.removeEventListener('hufs-demo-change', resetFilters);
  }, [professorCoursesApi.retry]);

  return (
    <ProfessorLanguageContext.Provider value={{ language: displayLanguage, setLanguage: setProfessorLanguage, t }}>
      <ProfFilterProvider value={{ filters, setFilters }}>
        <div className="workspace" data-role={session.role}>
          <header className="workspace__head">
            <div className="workspace__brand">
              <button
                type="button"
                className="workspace__home"
                aria-label={t(isStudent ? '학생 홈으로 이동' : '교수 홈으로 이동')}
                onClick={() => onNavigate(roleHome(session.role))}
              >
                <Wordmark compact />
              </button>
              <span className="workspace__divider" aria-hidden="true" />
              <span className="course-chip"><span aria-hidden="true">🇵🇹</span> PT · {t('포르투갈어')}</span>
            </div>
            <div className="workspace__tools">
              {!isStudent && (
                <>
                  <label className="header-select">
                    <span className="sr-only">{t('과목')}</span>
                    <select value={filters.course} onChange={event => setFilters(current => ({ ...current, course: event.target.value as ProfFilters['course'] }))}>
                      <option value="grammar">{t('포르투갈어 문법')}</option>
                      <option value="writing">{t('포르투갈어 읽기와 쓰기')}</option>
                      <option value="speaking">{t('포르투갈어 회화')}</option>
                    </select>
                  </label>
                  <label className="header-select">
                    <span className="sr-only">{t('분반')}</span>
                    <select value={filters.section} onChange={event => setFilters(current => ({ ...current, section: event.target.value as ProfFilters['section'] }))}>
                      <option value="01">{t('01분반')}</option>
                      <option value="02">{t('02분반')}</option>
                    </select>
                  </label>
                  <label className="header-select header-select--week">
                    <span className="sr-only">{t('주차')}</span>
                    <select value={filters.week} onChange={event => setFilters(current => ({ ...current, week: Number(event.target.value) }))}>
                      {(selectedCourse?.weeks ?? []).map((week) => <option key={week.week} value={week.week}>{displayLanguage === 'en' ? `Week ${week.week} · ${weekSuffix(week.week)}` : `${week.week}주차 · ${weekSuffix(week.week)}`}</option>)}
                    </select>
                  </label>
                  <ProfessorLanguagePicker language={professorLanguage} label={t('화면 언어')} onChange={setProfessorLanguage} />
                </>
              )}
              <div className="user-menu__identity">
                <span className="user-chip__avatar"><img src="/owls/football.png" alt="" aria-hidden="true" /></span>
                <span className="user-chip__text">
                  <b>{session.name}</b>
                  <small>{t(isStudent ? '학생' : '교수')} · {session.department}</small>
                </span>
              </div>
            </div>
          </header>
          {!isStudent && !path.startsWith('/prof/scope/new') && professorCoursesApi.loading && <ApiLoadingState label={t('교수 과목 필터를 불러오는 중…')} />}
          {!isStudent && !path.startsWith('/prof/scope/new') && professorCoursesApi.error && <ApiErrorState error={professorCoursesApi.error} onRetry={professorCoursesApi.retry} />}
          {isStudent ? (
            <StudentShell session={session} path={path} onNavigate={onNavigate} onToast={onToast} onSessionUpdate={onSessionUpdate} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />
          ) : (
            <ProfessorShell path={path} session={session} onNavigate={onNavigate} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay} externalError={professorCoursesApi.error} onRetryExternal={professorCoursesApi.retry} />
          )}
        </div>
      </ProfFilterProvider>
    </ProfessorLanguageContext.Provider>
  );
}
