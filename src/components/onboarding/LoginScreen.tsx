import { useState, type FormEvent } from 'react';
import { Wordmark } from '../Wordmark';
import { DEMO_PROFESSOR, DEMO_STUDENT, type Session } from '../../lib/session';

type Props = {
  onLogin: (session: Session) => void;
  onBack: () => void;
};

export function LoginScreen({ onLogin, onBack }: Props) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (studentId.trim().length < 2 || password.trim().length < 2) {
      setError('학번(또는 교번)과 비밀번호를 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      onLogin({ ...DEMO_STUDENT, studentId: studentId.trim() });
    }, 720);
  }

  function enterDemo(session: Session) {
    if (loading) return;
    setError('');
    setLoading(true);
    window.setTimeout(() => onLogin(session), 420);
  }

  return (
    <section className="login">
      <div className="login__visual">
        <div className="login__pattern" aria-hidden="true" />
        <Wordmark />
        <div className="login__visual-copy">
          <p className="login__serif">Olá.</p>
          <p className="login__quote">
            말해보세요.
            <br />
            교정은 바로 돌아옵니다.
          </p>
          <ul className="login__points">
            <li>
              <b>01</b> AI 튜터와 자유롭게 대화
            </li>
            <li>
              <b>02</b> 문장마다 즉시 교정
            </li>
            <li>
              <b>03</b> 교수님은 취약점만 모아 보기
            </li>
          </ul>
        </div>
        <div className="login__owl" aria-hidden="true">
          <img src="/owls/football.png" alt="" draggable={false} />
        </div>
        <p className="login__visual-foot">LISBOA · 38.72°N, 9.14°W</p>
      </div>

      <div className="login__panel">
        <div className="login__top">
          <span className="login__badge">DEMO LOGIN</span>
          <button type="button" className="login__back" onClick={onBack}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M16 10H4M9 5 4 10l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            인트로로
          </button>
        </div>

        <form className="login__card" onSubmit={submit} noValidate>
          <p className="login__eyebrow">
            <i aria-hidden="true" />
            3주차 · 카페에서 주문하기
          </p>
          <h2 className="login__title">다시, 말해볼까요?</h2>
          <p className="login__sub">이번 주 연습을 이어서 시작해요.</p>

          <label className="login__field">
            <span>학번 / 교번</span>
            <input
              type="text"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setError('');
              }}
              placeholder="예: 202503356"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="login__field">
            <span>비밀번호</span>
            <span className="login__password">
              <input
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                placeholder="비밀번호"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {visible ? '숨기기' : '보기'}
              </button>
            </span>
          </label>

          {error && (
            <p className="login__error" role="alert">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10 6.2v4.6M10 13.4v.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? '확인 중…' : '로그인'}
            {!loading && (
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M3.5 10h12M10.5 5l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <div className="login__divider">
            <i aria-hidden="true" />
            <span>또는</span>
            <i aria-hidden="true" />
          </div>

          <button type="button" className="login__demo" onClick={() => enterDemo(DEMO_STUDENT)} disabled={loading}>
            체험 계정으로 시작
          </button>
          <button
            type="button"
            className="login__demo login__demo--ghost"
            onClick={() => enterDemo(DEMO_PROFESSOR)}
            disabled={loading}
          >
            교수 계정으로 둘러보기
          </button>

          <p className="login__note">데모용 화면입니다. 어떤 값이든 통과하며 실제 인증 서버와 연결되지 않습니다.</p>
        </form>

        <p className="login__foot">HUFS ECHO · 특수외국어 AI 말하기·쓰기 연습</p>
      </div>
    </section>
  );
}
