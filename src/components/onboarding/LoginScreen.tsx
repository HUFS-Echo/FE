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

  function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mailId.trim().length < 2 || !/^[a-zA-Z0-9._-]+$/.test(mailId.trim())) { setError('학교 메일 아이디를 확인해 주세요.'); return; }
    setError(''); setLoading(true);
    window.setTimeout(() => { setLoading(false); setStage('code'); }, 1000);
  }
  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('6자리 숫자를 입력해 주세요.'); return; }
    setError(''); setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      const saved = getSavedProfile(role, email);
      if (saved) { onLogin(saved); return; }
      setName(demo.name); setStudentId(role === 'student' ? demo.studentId : ''); setDepartment(demo.department);
      setStage('profile');
    }, 420);
  }
  function finishProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (role === 'student' && !studentId.trim()) || !department.trim()) { setError('필수 정보를 입력해 주세요.'); return; }
    setError('');
    if (role === 'student') setStage('course');
    else onLogin({ ...demo, name: name.trim(), email, department: department.trim(), setupComplete: true });
  }
  function finishCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reissued = getDemoState().professorSettings.courseCodes;
    const issuedCodes = reissued && typeof reissued === 'object' ? Object.values(reissued as Record<string, string>) : [];
    const acceptedCodes = ['PT01', ...issuedCodes].map((value) => value.toUpperCase());
    if (!acceptedCodes.includes(courseCode.trim().toUpperCase())) { setError('유효한 데모 수업 코드를 입력해 주세요. (예: PT01)'); return; }
    onLogin({ ...DEMO_STUDENT, name: name.trim(), studentId: studentId.trim(), email, department: department.trim(), setupComplete: true });
  }
  const stepNumber = stage === 'email' ? 1 : stage === 'code' ? 2 : 3;
  const goBack = () => { setError(''); setStage(stage === 'code' ? 'email' : stage === 'course' ? 'profile' : 'email'); };
  return <section className="login">
    <div className="login__visual"><div className="login__pattern" aria-hidden="true"/><Wordmark/>
      <div className="login__visual-copy"><p className="login__serif">Olá!</p><p className="login__quote">저는 에코예요.<br/>말하고, 바로 교정받아요.</p>
        <ul className="login__points"><li><b>01</b> AI 튜터와 자유롭게 연습</li><li><b>02</b> 문장마다 즉시 교정</li><li><b>03</b> 교수님은 학습 범위를 설계</li></ul></div>
      <div className="login__owl" aria-hidden="true"><img src="/owls/football.png" alt="" draggable={false}/></div><p className="login__visual-foot">LISBOA · 38.72°N, 9.14°W</p>
    </div>
    <div className="login__panel"><div className="login__top"><span className="login__badge">HUFS ECHO · DEMO</span><button type="button" className="login__back" onClick={stage === 'email' ? onBack : goBack}>← {stage === 'email' ? '인트로로' : '이전'}</button></div>
      <div className="login__card">
        <p className="login__eyebrow"><i aria-hidden="true"/>3주차 · 포르투갈어</p>
        <div className="auth-steps"><span className={stepNumber >= 1 ? 'is-current' : ''}>1 학교 메일</span><i/><span className={stepNumber >= 2 ? 'is-current' : ''}>2 인증 코드</span>{(role === 'student' || stage === 'profile') && <><i/><span className={stepNumber >= 3 ? 'is-current' : ''}>3 {stage === 'course' ? '수업 코드' : role === 'student' ? '학생 정보' : '교수 정보'}</span></>}</div>
        {stage === 'email' && <><h2 className="login__title">HUFS Echo 시작하기</h2><p className="login__sub">역할과 학교 메일을 선택해 주세요.</p>
          <div className="auth-roles"><button type="button" className={role === 'student' ? 'is-active' : ''} onClick={() => {setRole('student');setError('');}}>학생으로 로그인</button><button type="button" className={role === 'professor' ? 'is-active' : ''} onClick={() => {setRole('professor');setError('');}}>교수로 로그인</button></div>
          <form onSubmit={sendCode} noValidate><label className="login__field"><span>학교 메일</span><span className="auth-email"><input value={mailId} onChange={e=>{setMailId(e.target.value.replace(/[^a-zA-Z0-9._-]/g,''));setError('');}} placeholder="메일 아이디" autoComplete="username" autoFocus/><b>@hufs.ac.kr</b></span></label>
            {error&&<p className="login__error" role="alert">{error}</p>}<button className="login__submit" disabled={loading}>{loading?'인증 코드 보내는 중…':'인증 코드 받기'} <span aria-hidden="true">→</span></button></form>
        </>}
        {stage === 'code' && <><h2 className="login__title">메일을 확인해 주세요</h2><p className="login__sub">{email} 주소로 인증 코드를 보냈어요.</p><form onSubmit={verifyCode} noValidate><label className="login__field"><span>인증 코드</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,'').slice(0,6));setError('');}} placeholder="6자리 숫자" autoFocus/></label><p className="auth-demo-note">데모: 아무 6자리 숫자를 입력하세요</p>{error&&<p className="login__error" role="alert">{error}</p>}<button className="login__submit" disabled={loading}>{loading?'확인 중…':'인증하고 계속하기'} <span aria-hidden="true">→</span></button></form></>}
        {stage === 'profile' && <><h2 className="login__title">{role==='student'?'학생 정보 입력':'교수 정보 입력'}</h2><p className="login__sub">처음 한 번만 입력하면 돼요.</p><form onSubmit={finishProfile} noValidate><label className="login__field"><span>이름</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="이름" autoFocus/></label>{role==='student'?<label className="login__field"><span>학번</span><input value={studentId} onChange={e=>setStudentId(e.target.value)} placeholder="예: 202503356"/> </label>:null}<label className="login__field"><span>소속 학과</span><input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="학과"/></label>{error&&<p className="login__error" role="alert">{error}</p>}<button className="login__submit">다음 <span aria-hidden="true">→</span></button></form></>}
        {stage === 'course' && <><h2 className="login__title">수업 코드를 입력해 주세요</h2><p className="login__sub">담당 교수님에게 받은 코드로 수업을 연결해요.</p><form onSubmit={finishCourse} noValidate><label className="login__field"><span>수업 코드</span><input value={courseCode} onChange={e=>{setCourseCode(e.target.value.toUpperCase());setError('');}} placeholder="수업 코드" autoFocus/></label><p className="auth-demo-note">데모 수업 코드: <b>PT01</b></p>{error&&<p className="login__error" role="alert">{error}</p>}<button className="login__submit">수업 연결하고 시작하기 <span aria-hidden="true">→</span></button></form></>}
      </div><p className="login__foot">인증·수업 데이터는 시연용이며 실제 메일은 발송되지 않습니다.</p>
    </div>
  </section>;
}
