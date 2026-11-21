import { useState } from 'react';
import {
  CORRECTION_HISTORY,
  HISTORY_TAGS,
  HISTORY_WEAKNESSES,
  type SubjectId,
} from '../../../config/learning';

type Props = {
  onPractice: (subject: SubjectId) => void;
  onToast: (message: string) => void;
};

export function CorrectionHistory({ onPractice, onToast }: Props) {
  const [filter, setFilter] = useState<(typeof HISTORY_TAGS)[number]>('전체');
  const items =
    filter === '전체'
      ? CORRECTION_HISTORY
      : CORRECTION_HISTORY.filter((item) => item.tag === filter);

  return (
    <div className="history">
      <header className="page-head">
        <div>
          <p className="eyebrow">REVISÃO · 3주차</p>
          <h1>교정 기록</h1>
          <p className="page-head__sub">다시 틀리지 않도록, 고친 문장을 모아봤어요.</p>
        </div>
        <button type="button" className="btn-solid" onClick={() => onPractice('reading')}>
          맞춤 연습 시작
          <ArrowIcon />
        </button>
      </header>

      <div className="history__filters" role="group" aria-label="오류 유형 필터">
        {HISTORY_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={filter === tag ? 'is-active' : ''}
            aria-pressed={filter === tag}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="history__grid">
        <div className="history__list">
          {items.length > 0 ? (
            items.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-item__meta">
                  <span>{item.date}</span>
                  <span>{item.week}</span>
                  <span className="tag">{item.tag}</span>
                </div>
                <p className="history-item__line">
                  <span className="strike">{item.original}</span>
                  <ArrowIcon />
                  <b>{item.corrected}</b>
                </p>
                <p className="history-item__note">{item.explanation}</p>
                <div className="history-item__foot">
                  <span className={item.repeat > 0 ? 'repeat is-warn' : 'repeat'}>
                    {item.repeat > 0 ? `${item.repeat}회 반복` : '재발 없음'}
                  </span>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => onPractice(item.subject)}
                  >
                    다시 연습
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="history__empty">이 유형의 교정 기록은 아직 없어요.</p>
          )}
        </div>

        <aside className="history__side">
          <section className="side-block side-block--card">
            <header className="block-head block-head--small">
              <div>
                <p className="eyebrow">PADRÕES</p>
                <h2>자주 틀리는 유형</h2>
              </div>
            </header>
            <div className="history-bars">
              {HISTORY_WEAKNESSES.map((weakness) => (
                <div className="history-bar" key={weakness.label}>
                  <div>
                    <span>{weakness.label}</span>
                    <b>{weakness.percent}%</b>
                  </div>
                  <i>
                    <em style={{ width: `${weakness.percent}%` }} />
                  </i>
                </div>
              ))}
            </div>
          </section>

          <div className="owl-tip owl-tip--compact">
            <div className="owl-tip__copy">
              <p className="eyebrow">DICA DO ECHO</p>
              <h3>관사가 반복돼요</h3>
              <p>명사의 성을 먼저 확인하면 um / uma가 덜 헷갈려요.</p>
              <button
                type="button"
                className="text-link"
                onClick={() => onToast('관사 맞춤 연습을 시작했어요. (데모)')}
              >
                맞춤 연습 시작
                <ArrowIcon />
              </button>
            </div>
            <img src="/owls/suitcase.png" alt="" draggable={false} />
          </div>
        </aside>
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
