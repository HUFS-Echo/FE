import { useState, type FormEvent } from 'react';
import { Wordmark } from '../Wordmark';
import { DEMO_PROFESSOR, DEMO_STUDENT, getSavedProfile, type Role, type Session } from '../../lib/session';
import { getDemoState } from '../../lib/demoStore';

type Props = { onLogin: (session: Session) => void; onBack: () => void };
type Stage = 'email' | 'code' | 'profile' | 'course';

export function LoginScreen({ onLogin, onBack }: Props) {
  const [role, setRole] = useState<Role>('student');
  const [stage, setStage] = useState<Stage>('email');
  const [mailId, setMailId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('포르투갈어과');
  const [courseCode, setCourseCode] = useState('PT01');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const email = `${mailId.trim()}@hufs.ac.kr`;
  const demo = role === 'student' ? DEMO_STUDENT : DEMO_PROFESSOR;
  const steps = role === 'student'
    ? ['학교 메일', '인증 코드', '학생 정보', '수업 연결']
    : ['학교 메일', '인증 코드', '교수 정보'];
  const activeStep = stage === 'email' ? 0 : stage === 'code' ? 1 : stage === 'profile' ? 2 : 3;
  const currentStep = steps[Math.min(activeStep, steps.length - 1)];
  const progress = ((activeStep + 1) / steps.length) * 100;

  function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mailId.trim().length < 2 || !/^[a-zA-Z0-9._-]+$/.test(mailId.trim())) {
      setError('학교 메일 아이디를 확인해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStage('code');
    }, 1000);
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('인증 코드는 숫자 6자리로 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      const saved = getSavedProfile(role, email);
      if (saved) {
        onLogin(saved);
        return;
      }
      setName(demo.name);
      setStudentId(role === 'student' ? demo.studentId : '');
      setDepartment(demo.department);
      setStage('profile');
    }, 420);
  }

  function finishProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (role === 'student' && !studentId.trim()) || !department.trim()) {
      setError('필수 정보를 입력해 주세요.');
      return;
    }
    setError('');
    if (role === 'student') {
      setStage('course');
    } else {
      onLogin({ ...demo, name: name.trim(), email, department: department.trim(), setupComplete: true });
    }
  }

  function finishCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reissued = getDemoState().professorSettings.courseCodes;
    const issuedCodes = reissued && typeof reissued === 'object' ? Object.values(reissued as Record<string, string>) : [];
    const acceptedCodes = ['PT01', ...issuedCodes].map((value) => value.toUpperCase());
    if (!acceptedCodes.includes(courseCode.trim().toUpperCase())) {
      setError('유효한 데모 수업 코드를 입력해 주세요. (예: PT01)');
      return;
    }
    onLogin({ ...DEMO_STUDENT, name: name.trim(), studentId: studentId.trim(), email, department: department.trim(), setupComplete: true });
  }

  function goBack() {
    setError('');
    setStage(stage === 'code' ? 'email' : stage === 'course' ? 'profile' : 'email');
  }

  return (
    <section className="login">
      <div className="login__visual">
        <div className="login__pattern" aria-hidden="true" />
        <Wordmark />
        <div className="login__visual-copy">
          <p className="login__serif">Olá!</p>
          <p className="login__quote">저는 에코예요.<br />말하고, 바로 교정받아요.</p>
          <ul className="login__points">
            <li><b>01</b> AI 튜터와 자유롭게 연습</li>
            <li><b>02</b> 문장마다 즉시 교정</li>
            <li><b>03</b> 교수님은 학습 범위를 설계</li>
          </ul>
        </div>
        <div className="login__owl" aria-hidden="true"><img src="/owls/football.png" alt="" draggable={false} /></div>
        <p className="login__visual-foot">LISBOA · 38.72°N, 9.14°W</p>
      </div>

      <div className="login__panel">
        <div className="login__top">
          <span className="login__badge">HUFS ECHO · DEMO</span>
          <button type="button" className="login__back" onClick={stage === 'email' ? onBack : goBack}>
            {stage === 'email' ? '← 인트로로' : '← 이전'}
          </button>
        </div>

        <div className="login__card">
          <div className="auth-progress" aria-label={`로그인 ${activeStep + 1}단계: ${currentStep}`}>
            <div className="auth-progress__meta">
              <span>STEP {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
              <b>{currentStep}</b>
            </div>
            <div className="auth-progress__track" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={activeStep + 1}>
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>

          {stage === 'email' && <>
            <h1 className="login__title">학교 메일로 로그인해요</h1>
            <p className="login__sub">역할을 선택하고 학교 메일 아이디를 입력해 주세요.</p>
            <div className="auth-roles" role="group" aria-label="로그인 역할">
              <button type="button" className={role === 'student' ? 'is-active' : ''} aria-pressed={role === 'student'} onClick={() => { setRole('student'); setError(''); }}>
                <b>학생</b><span>학습과 연습을 이어가요</span>
              </button>
              <button type="button" className={role === 'professor' ? 'is-active' : ''} aria-pressed={role === 'professor'} onClick={() => { setRole('professor'); setError(''); }}>
                <b>교수</b><span>수업과 학습을 관리해요</span>
              </button>
            </div>
            <form className="auth-form" onSubmit={sendCode} noValidate>
              <label className="login__field">
                <span>학교 메일 아이디</span>
                <span className="auth-email">
                  <input value={mailId} onChange={(event) => { setMailId(event.target.value.replace(/[^a-zA-Z0-9._-]/g, '')); setError(''); }} placeholder="예: 이름 또는 학번" autoComplete="username" autoFocus />
                  <b>@hufs.ac.kr</b>
                </span>
              </label>
              {error && <p className="login__error" role="alert">{error}</p>}
              <button className="login__submit" disabled={loading}>
                {loading ? '인증 코드를 준비하고 있어요…' : '인증 코드 받기'}<span aria-hidden="true">→</span>
              </button>
            </form>
          </>}

          {stage === 'code' && <>
            <h1 className="login__title">인증 코드를 입력해 주세요</h1>
            <p className="login__sub"><b className="auth-email-address">{email}</b> 주소로 인증 코드를 보냈어요.</p>
            <form className="auth-form" onSubmit={verifyCode} noValidate>
              <label className="login__field">
                <span>인증 코드 6자리</span>
                <input className="auth-code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="숫자 6자리" autoFocus />
              </label>
              <p className="auth-demo-note"><b>DEMO</b><span>아무 6자리 숫자를 입력하면 계속할 수 있어요.</span></p>
              {error && <p className="login__error" role="alert">{error}</p>}
              <button className="login__submit" disabled={loading}>{loading ? '확인하고 있어요…' : '인증하고 계속하기'}<span aria-hidden="true">→</span></button>
            </form>
          </>}

          {stage === 'profile' && <>
            <h1 className="login__title">기본 정보를 입력해 주세요</h1>
            <p className="login__sub">처음 로그인할 때 한 번만 필요한 정보예요.</p>
            <form className="auth-form" onSubmit={finishProfile} noValidate>
              <label className="login__field"><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" autoComplete="name" autoFocus /></label>
              {role === 'student' && <label className="login__field"><span>학번</span><input value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="예: 202503356" autoComplete="off" /> </label>}
              <label className="login__field"><span>소속 학과</span><input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="학과" /></label>
              {error && <p className="login__error" role="alert">{error}</p>}
              <button className="login__submit">{role === 'student' ? '다음 단계로' : '교수 화면으로'}<span aria-hidden="true">→</span></button>
            </form>
          </>}

          {stage === 'course' && <>
            <h1 className="login__title">수업 코드를 입력해 주세요</h1>
            <p className="login__sub">담당 교수님에게 받은 코드로 수업을 연결해요.</p>
            <form className="auth-form" onSubmit={finishCourse} noValidate>
              <label className="login__field"><span>수업 코드</span><input value={courseCode} onChange={(event) => { setCourseCode(event.target.value.toUpperCase()); setError(''); }} placeholder="수업 코드" autoComplete="off" autoFocus /></label>
              <p className="auth-demo-note"><b>DEMO</b><span>테스트 코드 <strong>PT01</strong>을 입력해 시작할 수 있어요.</span></p>
              {error && <p className="login__error" role="alert">{error}</p>}
              <button className="login__submit">수업 연결하고 시작하기<span aria-hidden="true">→</span></button>
            </form>
          </>}
        </div>
        <p className="login__foot">학교 메일 기반 HUFS Echo 시연 로그인 · 실제 인증 메일은 발송되지 않습니다</p>
      </div>
    </section>
  );
}
