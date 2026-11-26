import { useState, type FormEvent } from 'react';
import type { Session } from '../../lib/session';
import type { Role } from '../../api/types';
import { loginWithProfile } from '../../api/auth';

type Props = {
  onLogin: (session: Session) => void;
  onBack: () => void;
  onSignup: () => void;
};

export function LoginScreen({ onLogin, onBack, onSignup }: Props) {
  const [role, setRole] = useState<Role>('STUDENT');
  const [mailId, setMailId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedId = mailId.trim();
    if (normalizedId.length < 2 || !/^[a-zA-Z0-9._-]+$/.test(normalizedId)) {
      setError('학교 메일 아이디를 확인해 주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    void loginWithProfile({ role: role, emailId: normalizedId, password })
      .then(onLogin)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '로그인에 실패했어요.'));
  }

  return (
    <section className="login">
      <div className="login__panel">
        <div className="login__top">
          <span className="login__badge">HUFS ECHO</span>
          <button type="button" className="login__back" onClick={onBack}>← 첫 화면으로</button>
        </div>

        <div className="login__card">
          <h1 className="login__title">기존 회원 로그인</h1>
          <p className="login__sub">역할을 선택하고 학교 메일과 비밀번호를 입력해 주세요.</p>

          <div className="auth-roles" role="group" aria-label="로그인 역할">
            <button type="button" className={role === 'STUDENT' ? 'is-active' : ''} aria-pressed={role === 'STUDENT'} onClick={() => { setRole('STUDENT'); setError(''); }}>
              <b>학생</b><span>학습과 연습을 이어가요</span>
            </button>
            <button type="button" className={role === 'PROFESSOR' ? 'is-active' : ''} aria-pressed={role === 'PROFESSOR'} onClick={() => { setRole('PROFESSOR'); setError(''); }}>
              <b>교수</b><span>수업과 학습을 관리해요</span>
            </button>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="login__field">
              <span>학교 메일</span>
              <span className="auth-email">
                <input value={mailId} onChange={(event) => { setMailId(event.target.value.replace(/[^a-zA-Z0-9._-]/g, '')); setError(''); }} placeholder="학교 메일" autoComplete="username" autoFocus />
                <b>@hufs.ac.kr</b>
              </span>
            </label>
            <label className="login__field">
              <span>비밀번호</span>
              <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="비밀번호" autoComplete="current-password" />
            </label>
            {error && <p className="login__error" role="alert">{error}</p>}
            <button className="login__submit">{role === 'STUDENT' ? '학생으로 로그인' : '교수로 로그인'}<span aria-hidden="true">→</span></button>
          </form>

          <p className="auth-switch">아직 회원이 아니신가요? <button type="button" onClick={onSignup}>회원가입</button></p>
        </div>
      </div>
    </section>
  );
}
