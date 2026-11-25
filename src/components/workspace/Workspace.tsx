import { useEffect, useState } from 'react';
import { Wordmark } from '../Wordmark';
import { WEEK } from '../../config/learning';
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

function initialFilters(): ProfFilters {
  try {
    return { ...defaultProfFilters, ...JSON.parse(localStorage.getItem('hufs-echo.prof-filters.v1') || '{}') };
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

export function Workspace({ session, path, onNavigate, onSessionUpdate, onLogout, onToast, onReset, onReplay }: Props) {
  const [filters, setFilters] = useState<ProfFilters>(initialFilters);
  const [professorLanguage, setProfessorLanguage] = useState<ProfessorLanguage>(initialProfessorLanguage);
  const isStudent = session.role === 'student';
  const displayLanguage: ProfessorLanguage = isStudent ? 'ko' : professorLanguage;
  const t = (text: string) => translateProfessorText(displayLanguage, text);

  useEffect(() => {
    localStorage.setItem('hufs-echo.prof-filters.v1', JSON.stringify(filters));
  }, [filters]);

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
    };
    window.addEventListener('hufs-demo-change', resetFilters);
    return () => window.removeEventListener('hufs-demo-change', resetFilters);
  }, []);

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
                      <option value="reading">{t('포르투갈어 문법')}</option>
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
                      <option value={1}>{t('1주차 · 종료')}</option>
                      <option value={2}>{t('2주차 · 종료')}</option>
                      <option value={3}>{t(`3주차 · ${WEEK.dates}`)}</option>
                      <option value={4}>{t('4주차 · 예약')}</option>
                      <option value={5}>{t('5주차 · 임시 저장')}</option>
                    </select>
                  </label>
                  <label className="header-language">
                    <span className="sr-only">{t('화면 언어')}</span>
                    <span className="header-language__mark" aria-hidden="true">文</span>
                    <select aria-label={t('화면 언어')} value={professorLanguage}
                      onChange={event => setProfessorLanguage(event.target.value as ProfessorLanguage)}>
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                    </select>
                  </label>
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
          {isStudent ? (
            <StudentShell session={session} path={path} onNavigate={onNavigate} onToast={onToast} onSessionUpdate={onSessionUpdate} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />
          ) : (
            <ProfessorShell path={path} session={session} onNavigate={onNavigate} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />
          )}
        </div>
      </ProfFilterProvider>
    </ProfessorLanguageContext.Provider>
  );
}
