import {
  ERROR_TREND,
  PROGRESS_STATS,
  RECENT_DAYS,
  WEEKLY_PROGRESS,
} from '../../../config/learning';

export function ProgressView() {
  const maxPractices = Math.max(...WEEKLY_PROGRESS.map((week) => week.practices), 1);

  return (
    <div className="progress-view">
      <header className="page-head">
        <div>
          <p className="eyebrow">PROGRESSO · 3주차</p>
          <h1>내 진행률</h1>
          <p className="page-head__sub">이번 주까지 쌓인 연습과 교정의 흐름이에요.</p>
        </div>
        <span className="page-head__pill">최근 7일 기준</span>
      </header>

      <div className="progress-kpis">
        <div className="progress-kpi">
          <span>누적 연습</span>
          <b>{PROGRESS_STATS.total}<small>회</small></b>
          <em>지난주보다 +6회</em>
        </div>
        <div className="progress-kpi">
          <span>연속 연습</span>
          <b>{PROGRESS_STATS.streak}<small>일</small></b>
          <em>이번 주 4일 남았어요</em>
        </div>
        <div className="progress-kpi progress-kpi--mint">
          <span>평균 정확도</span>
          <b>{PROGRESS_STATS.accuracy}<small>%</small></b>
          <em>가장 높은 주차예요</em>
        </div>
        <div className="progress-kpi progress-kpi--amber">
          <span>같은 오류 재발률</span>
          <b>{PROGRESS_STATS.recurrence}<small>%</small></b>
          <em>지난주보다 -7%</em>
        </div>
      </div>

      <div className="progress-grid">
        <section className="chart-card chart-card--wide">
          <header className="block-head block-head--small">
            <div>
              <p className="eyebrow">SEMANAS</p>
              <h2>주차별 연습량</h2>
            </div>
            <span className="block-head__meta">연습 횟수 · 정확도</span>
          </header>
          <div className="weekly-bars">
            {WEEKLY_PROGRESS.map((week, index) => {
              const active = index === 2;
              const height = week.practices > 0 ? Math.max(6, (week.practices / maxPractices) * 100) : 0;
              return (
                <div className={`week-bar ${active ? 'is-active' : ''}`} key={week.week}>
                  <div className="week-bar__value">{week.practices > 0 ? week.practices : '—'}</div>
                  <div className="week-bar__track">
                    <i style={{ height: `${height}%` }} />
                  </div>
                  <span>{week.week}</span>
                  <small>{week.practices > 0 ? `${week.accuracy}%` : '예정'}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="chart-card">
          <header className="block-head block-head--small">
            <div>
              <p className="eyebrow">ÚLTIMOS 7 DIAS</p>
              <h2>최근 7일</h2>
            </div>
            <span className="block-head__meta">연습 점</span>
          </header>
          <div className="recent-days">
            {RECENT_DAYS.map((day) => (
              <div className="recent-day" key={day.day}>
                <div className="recent-day__track">
                  <i style={{ height: `${Math.max(8, (day.value / 3) * 100)}%` }} />
                </div>
                <span>{day.day}</span>
              </div>
            ))}
          </div>
          <p className="chart-card__note">가장 많이 연습한 날은 목요일이에요.</p>
        </section>

        <section className="chart-card chart-card--full">
          <header className="block-head block-head--small">
            <div>
              <p className="eyebrow">ERROS</p>
              <h2>오류 유형별 변화</h2>
            </div>
            <span className="block-head__meta">1–3주차</span>
          </header>
          <div className="error-table-wrap">
            <table className="error-table">
              <thead>
                <tr>
                  <th>오류 유형</th>
                  <th>1주차</th>
                  <th>2주차</th>
                  <th>3주차</th>
                  <th>변화</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_TREND.map((row) => (
                  <tr key={row.label}>
                    <td>
                      <b>{row.label}</b>
                    </td>
                    <td>{row.w1}%</td>
                    <td>{row.w2}%</td>
                    <td>
                      <strong>{row.w3}%</strong>
                    </td>
                    <td>
                      <span className={row.delta < 0 ? 'delta is-good' : 'delta'}>
                        {row.delta < 0 ? '↓' : '↑'} {Math.abs(row.delta)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
