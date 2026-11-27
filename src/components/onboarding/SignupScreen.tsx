import { useState, type FormEvent } from 'react';
import type { Session } from '../../lib/session';
import type { Role } from '../../api/types';
import { signupWithProfile } from '../../api/auth';

type Props = {
  onSignup: (session: Session) => void;
  onBack: () => void;
  onLogin: () => void;
};

export function SignupScreen({ onSignup, onBack, onLogin }: Props) {
  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [mailId, setMailId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedId = mailId.trim();
    if (!name.trim() || !department.trim() || (role === 'STUDENT' && !studentId.trim()) || (role === 'PROFESSOR' && !professorId.trim())) {
      setError('필수 정보를 모두 입력해 주세요.');
      return;
    }
    if (normalizedId.length < 2 || !/^[a-zA-Z0-9._-]+$/.test(normalizedId)) {
      setError('학교 메일 아이디를 확인해 주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상 입력해 주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않아요.');
      return;
    }

    void signupWithProfile({ role: role, name: name.trim(), emailId: normalizedId, studentId: role === 'STUDENT' ? studentId.trim() : null, professorId: role === 'PROFESSOR' ? professorId.trim() : null, department: department.trim(), password, passwordConfirm })
      .then(onSignup)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '회원가입에 실패했어요.'));
  }

  return (
    <section className="login">
      <div className="login__panel">
        <div className="login__top">
          <span className="login__badge">HUFS ECHO</span>
          <button type="button" className="login__back" onClick={onBack}>← 첫 화면으로</button>
        </div>

        <div className="login__card login__card--signup">
          <h1 className="login__title">회원가입</h1>
          <p className="login__sub">역할과 기본 정보를 입력해 가입을 진행해 주세요.</p>

          <div className="auth-roles" role="group" aria-label="가입 역할">
            <button type="button" className={role === 'STUDENT' ? 'is-active' : ''} aria-pressed={role === 'STUDENT'} onClick={() => { setRole('STUDENT'); setError(''); }}>
              <b>학생</b><span>학습과 연습을 이어가요</span>
            </button>
            <button type="button" className={role === 'PROFESSOR' ? 'is-active' : ''} aria-pressed={role === 'PROFESSOR'} onClick={() => { setRole('PROFESSOR'); setError(''); }}>
              <b>교수</b><span>수업과 학습을 관리해요</span>
            </button>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="login__field"><span>이름</span><input value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="이름" autoComplete="name" autoFocus /></label>
            <label className="login__field">
              <span>학교 메일</span>
              <span className="auth-email">
                <input value={mailId} onChange={(event) => { setMailId(event.target.value.replace(/[^a-zA-Z0-9._-]/g, '')); setError(''); }} placeholder="학교 메일 아이디" autoComplete="email" />
                <b>@hufs.ac.kr</b>
              </span>
            </label>
            {role === 'STUDENT' && <label className="login__field"><span>학번</span><input value={studentId} onChange={(event) => { setStudentId(event.target.value); setError(''); }} placeholder="예: 202503356" autoComplete="off" /></label>}
            {role === 'PROFESSOR' && <label className="login__field"><span>교번</span><input value={professorId} onChange={(event) => { setProfessorId(event.target.value); setError(''); }} placeholder="교번" autoComplete="off" /></label>}
            <label className="login__field"><span>학과</span><input value={department} onChange={(event) => { setDepartment(event.target.value); setError(''); }} placeholder="소속 학과" autoComplete="organization-title" /></label>
            <label className="login__field"><span>비밀번호</span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="8자 이상" autoComplete="new-password" /></label>
            <label className="login__field"><span>비밀번호 확인</span><input type="password" value={passwordConfirm} onChange={(event) => { setPasswordConfirm(event.target.value); setError(''); }} placeholder="비밀번호를 다시 입력해 주세요" autoComplete="new-password" /></label>
            {error && <p className="login__error" role="alert">{error}</p>}
            <button className="login__submit">{role === 'STUDENT' ? '학생으로 가입하기' : '교수로 가입하기'}<span aria-hidden="true">→</span></button>
          </form>

          <p className="auth-switch">이미 회원이신가요? <button type="button" onClick={onLogin}>기존 회원 로그인</button></p>
        </div>
      </div>
    </section>
  );
}
