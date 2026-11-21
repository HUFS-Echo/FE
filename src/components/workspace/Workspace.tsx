import { useState } from 'react';
import { Wordmark } from '../Wordmark';
import { DEMO_PROFESSOR, type Role, type Session } from '../../lib/session';
import { ProfessorDashboard } from './ProfessorDashboard';
import { StudentPractice } from './StudentPractice';

type Props = {
  session: Session;
  onLogout: () => void;
  onToast: (message: string) => void;
};

export function Workspace({ session, onLogout, onToast }: Props) {
  const [role, setRole] = useState<Role>(session.role);
  const isStudent = role === 'student';
  const person = isStudent ? session : DEMO_PROFESSOR;

  return (
    <div className="workspace">
      <header className="workspace__head">
        <div className="workspace__brand">
          <Wordmark compact />
          <span className="workspace__divider" aria-hidden="true" />
          <span className="workspace__course">포르투갈어과 · 3주차</span>
        </div>

        <div className="workspace__tools">
          <div className="role-switch" role="group" aria-label="데모 역할 전환">
            <button
              type="button"
              className={isStudent ? 'is-active' : ''}
              aria-pressed={isStudent}
              onClick={() => setRole('student')}
            >
              학생
            </button>
            <button
              type="button"
              className={!isStudent ? 'is-active' : ''}
              aria-pressed={!isStudent}
              onClick={() => setRole('professor')}
            >
              교수
            </button>
          </div>

          <div className="user-chip">
            <span className="user-chip__avatar">{person.name.slice(0, 1)}</span>
            <span className="user-chip__text">
              <b>{person.name}</b>
              <small>{person.department}</small>
            </span>
          </div>

          <button type="button" className="logout" onClick={onLogout} aria-label="로그아웃">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M8 3.5H4.5v13H8M12.5 6.5 16 10l-3.5 3.5M7 10h9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {isStudent ? <StudentPractice onToast={onToast} /> : <ProfessorDashboard onToast={onToast} />}
    </div>
  );
}
