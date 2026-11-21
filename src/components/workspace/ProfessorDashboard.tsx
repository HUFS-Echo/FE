import { CLASS_STATS, STUDENT_ROWS, WEAKNESSES } from '../../config/demo';

type Props = {
  onToast: (message: string) => void;
};

const KPIS = [
  { label: '연습 참여', value: `${CLASS_STATS.active} / ${CLASS_STATS.students}`, delta: '86% 참여', tone: 'blue' },
  { label: '총 발화', value: `${CLASS_STATS.practices}`, delta: '지난주 +18%', tone: 'sky' },
  { label: '교정 확인률', value: `${CLASS_STATS.correctionRate}%`, delta: '평균 1.8회 확인', tone: 'mint' },
  { label: '집중 관리', value: '3명', delta: '관사·동사 변형', tone: 'amber' },
];

export function ProfessorDashboard({ onToast }: Props) {
  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <div>
          <p className="practice__eyebrow">PROFESSOR · PORTUGUÊS A1</p>
          <h1>이번 주, 어디서 막혔을까요?</h1>
          <p className="dashboard__sub">3주차 카페 단원 · 11월 18일 ~ 11월 21일 · 28명</p>
        </div>
        <div className="dashboard__actions">
          <button
            type="button"
            className="dashboard__ghost"
            onClick={() => onToast('이번 주 요약을 복사했어요. (데모)')}
          >
            요약 복사
          </button>
          <button
            type="button"
            className="dashboard__solid"
            onClick={() => onToast('수업 자료 생성은 데모에서 제공하지 않아요.')}
          >
            수업 자료 만들기
          </button>
        </div>
      </header>

      <div className="kpis">
        {KPIS.map((kpi) => (
          <div className={`kpi kpi--${kpi.tone}`} key={kpi.label}>
            <span>{kpi.label}</span>
            <b>{kpi.value}</b>
            <small>{kpi.delta}</small>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        <section className="panel panel--wide">
          <header className="panel__head">
            <div>
              <h2>자주 틀리는 표현</h2>
              <p>전체 342문장에서 반복된 교정 유형</p>
            </div>
            <span className="panel__pill">이번 주</span>
          </header>
          <div className="weaknesses">
            {WEAKNESSES.map((weakness) => (
              <div className="weak" key={weakness.label}>
                <div className="weak__top">
                  <b>{weakness.label}</b>
                  <span>{weakness.percent}%</span>
                </div>
                <div className="weak__bar">
                  <i style={{ width: `${weakness.percent}%` }} />
                </div>
                <p>
                  {weakness.note} · <em>{weakness.example}</em>
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel next-class">
          <span className="side-label">다음 수업 제안</span>
          <h3>4주차 · 시장에서</h3>
          <p>관사 오류가 42%로 가장 많아요. 시장 단원 전에 um/uma 10분 복습을 넣어보세요.</p>
          <ul>
            <li>관사 워밍업 10분</li>
            <li>가격 묻기 롤플레이</li>
            <li>파스텔 가게 어휘</li>
          </ul>
          <button type="button" onClick={() => onToast('수업 계획에 추가했어요. (데모)')}>
            수업 계획에 추가
          </button>
        </aside>

        <section className="panel panel--full">
          <header className="panel__head">
            <div>
              <h2>학생별 연습 현황</h2>
              <p>이름은 익명 처리 · 최근 7일</p>
            </div>
            <span className="panel__pill">관사 집중 3명</span>
          </header>
          <div className="table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>학생</th>
                  <th>연습 횟수</th>
                  <th>자주 틀린 유형</th>
                  <th>최근 활동</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {STUDENT_ROWS.map((student) => (
                  <tr key={student.studentId}>
                    <td>
                      <b>{student.name}</b>
                      <small>{student.studentId}</small>
                    </td>
                    <td>{student.practices}회</td>
                    <td>
                      <span className="table-tag">{student.error}</span>
                    </td>
                    <td>{student.last}</td>
                    <td>
                      <span className={`status status--${student.level}`}>
                        {student.level === 'high' ? '집중 관리' : student.level === 'mid' ? '관찰' : '양호'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="panel__note">표시된 이름은 익명 처리된 데모 데이터입니다.</p>
        </section>
      </div>
    </div>
  );
}
