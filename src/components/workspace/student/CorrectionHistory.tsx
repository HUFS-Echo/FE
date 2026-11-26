import { useState } from 'react';
import {
  HISTORY_WEEK_FILTERS,
} from '../../../api/adapters';
import { useApi, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import { getCorrections } from '../../../api/corrections';

type Props = {
  onCustomPractice: () => void;
};

export function CorrectionHistory({ onCustomPractice }: Props) {
  const [filter, setFilter] = useState<(typeof HISTORY_WEEK_FILTERS)[number]>('전체');
  const week = filter === '전체' ? undefined : Number(filter.replace(/\D/g, ''));
  const corrections = useApi(() => getCorrections({ week }), [week]);
  const items = corrections.data?.items.map((item, index) => ({ id: String(item.correctionId), date: index < 2 ? '오늘' : '어제', week: `${item.week}주차`, original: item.original, corrected: item.corrected, explanation: item.explanation })) ?? [];

  return (
    <div className="history">
      <header className="page-head">
        <div>
          <p className="eyebrow">REVISÃO · {filter === '전체' ? '전체 기록' : filter}</p>
          <h1>교정 기록</h1>
          <p className="page-head__sub">다시 틀리지 않도록, 고친 문장을 모아봤어요.</p>
        </div>
        <button type="button" className="btn-solid" onClick={onCustomPractice}>
          맞춤 연습 시작
          <ArrowIcon />
        </button>
      </header>

      <div className="history__filters" role="group" aria-label="주차 필터">
        {HISTORY_WEEK_FILTERS.map((tag) => (
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
          {corrections.loading ? <ApiLoadingState label="교정 기록을 불러오는 중…" /> : corrections.error ? <ApiErrorState error={corrections.error} onRetry={corrections.retry} /> : items.length > 0 ? (
            items.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-item__meta">
                  <span>{item.date}</span>
                  <span>{item.week}</span>
                </div>
                <p className="history-item__line">
                  <span className="strike">{item.original}</span>
                  <ArrowIcon />
                  <b>{item.corrected}</b>
                </p>
                <p className="history-item__note">{item.explanation}</p>
              </article>
            ))
          ) : (
            <p className="history__empty">{filter === '전체' ? '교정 기록이 아직 없어요.' : `${filter} 교정 기록은 아직 없어요.`}</p>
          )}
        </div>
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
