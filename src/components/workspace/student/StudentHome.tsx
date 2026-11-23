import { PRACTICE_SETS, WEEK, getSubject, type SubjectId } from '../../../config/learning';
import type { Session } from '../../../lib/session';
import { MiniGlobe } from './MiniGlobe';

type Props = {
  session: Session;
  subject: SubjectId;
  onOpen: (id: SubjectId) => void;
  onToast: (message: string) => void;
};

export function StudentHome({ session, subject, onOpen, onToast }: Props) {
  const current = getSubject(subject);
  const sets = PRACTICE_SETS[subject];

  return (
    <div className="home">
      <header className="home__top">
        <div>
          <p className="home__eyebrow">{WEEK.label} · PORTUGUÊS A1</p>
          <h1>
            <span>Olá,</span> {session.name}님!
          </h1>
          <p className="home__sub">
            <b>Olá</b>는 포르투갈어로 안녕하세요예요.
          </p>
        </div>
      </header>

      <section className={`hero-card hero-card--${current.tone}`}>
        <span className="hero-card__grid" aria-hidden="true" />
        <div className="hero-card__copy">
          <p className="hero-card__eyebrow">THIS WEEK · {WEEK.label}</p>
          <h2>{current.rangeTitle}</h2>
          <p className="hero-card__meta">
            <span>{current.pdf}</span>
            <i aria-hidden="true" />
            <span>{current.deadline}</span>
            <i aria-hidden="true" />
            <span>A1</span>
          </p>

          <div className="hero-card__progress">
            <div className="hero-card__progress-top">
              <span>이번 주 진행률</span>
              <b>{current.progress}%</b>
            </div>
            <div className="hero-card__bar">
              <i style={{ width: `${current.progress}%` }} />
            </div>
          </div>

          <div className="hero-card__actions">
            <button type="button" className="hero-card__cta" onClick={() => onOpen(current.id)}>
              {current.cta}
              <ArrowIcon />
            </button>
            <button
              type="button"
              className="hero-card__ghost"
              onClick={() => onToast('이번 주 교재 범위를 확인했어요. (데모)')}
            >
              범위 보기
            </button>
          </div>
        </div>

        <div className="hero-card__visual">
          <MiniGlobe />
          <p className="hero-card__caption">SEOUL → LISBOA</p>
        </div>
      </section>

      <div className="home__grid">
        <section className="home-sets">
          <header className="block-head">
            <div>
              <p className="eyebrow">PRÁTICA</p>
              <h2>이번 주 연습 세트</h2>
            </div>
            <span className="block-head__meta">{sets.length}개 세트</span>
          </header>

          <div className="set-list">
            {sets.map((set) => {
              const percent = Math.round((set.done / set.count) * 100);
              const action = set.done >= set.count ? '복습하기' : set.done > 0 ? '이어서' : '시작하기';
              return (
                <button
                  key={set.id}
                  type="button"
                  className={`set-card set-card--${set.status}`}
                  onClick={() => onOpen(set.subject)}
                >
                  <span className="set-card__icon" aria-hidden="true">
                    <SetIcon kind={set.kind} />
                  </span>
                  <span className="set-card__body">
                    <span className="set-card__kind">{set.kind}</span>
                    <b>{set.title}</b>
                    <span className="set-card__desc">{set.desc}</span>
                    <span className="set-card__meta">
                      {set.count}문제 · 약 {set.minutes}분
                    </span>
                    <span className="set-card__bar" aria-hidden="true">
                      <i style={{ width: `${percent}%` }} />
                    </span>
                  </span>
                  <span className="set-card__action">
                    {action}
                    <ArrowIcon />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SetIcon({ kind }: { kind: string }) {
  if (kind === '독해' || kind === '표현') {
    return (
      <svg viewBox="0 0 20 20">
        <path
          d="M4 4.5h4.5c1 0 1.5.5 1.5 1.4v9.6c0-.9-.6-1.4-1.5-1.4H4ZM16 4.5h-4.5c-1 0-1.5.5-1.5 1.4v9.6c0-.9.6-1.4 1.5-1.4H16Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === '작문' || kind === '쓰기' || kind === '교정' || kind === '다시 쓰기') {
    return (
      <svg viewBox="0 0 20 20">
        <path d="m3.5 16.5 1-3.8L14 3.2a1.7 1.7 0 0 1 2.4 2.4L6.9 15.1l-3.4 1.4Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="m12.8 4.5 2.4 2.4" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  if (kind === '역할극' || kind === '자유 대화') {
    return (
      <svg viewBox="0 0 20 20">
        <path d="M3.5 4.5h13v8.2H9l-3.5 2.8v-2.8H3.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M7 8h6M7 10.5h4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 10h7M10 6.5v7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
