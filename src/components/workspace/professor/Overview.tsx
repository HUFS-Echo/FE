import { getDemoState } from '../../../lib/demoStore';
import { useProfFilters, type ProfFilters } from './ProfFilterContext';

type Props = {
  onNavigate: (path: string) => void;
  onToast: (message: string) => void;
};

type StudentRow = [
  name: string,
  id: string,
  progress: number,
  practices: number,
  error: number,
  weakness: string,
  lastActivity: string,
];

const subjectNames: Record<ProfFilters['course'], string> = {
  writing: '포르투갈어 읽기와 쓰기',
  reading: '포르투갈어 문법',
  speaking: '포르투갈어 회화',
};

const weekDates: Record<number, string> = {
  1: '11.03–11.09',
  2: '11.10–11.16',
  3: '11.17–11.23',
  4: '11.24–11.30',
  5: '12.01–12.07',
};

const progressByCourse: Record<ProfFilters['course'], Record<number, number>> = {
  reading: { 1: 91, 2: 76, 3: 64, 4: 0, 5: 0 },
  writing: { 1: 86, 2: 72, 3: 0, 4: 0, 5: 0 },
  speaking: { 1: 89, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const studentsByCourse: Record<ProfFilters['course'], StudentRow[]> = {
  reading: [
    ['김*윤', '2025****11', 78, 12, 34, '관사·전치사', '오늘 10:42'],
    ['박*은', '2024****28', 64, 9, 31, '주어 생략', '오늘 09:18'],
    ['이*아', '2025****04', 52, 7, 29, '관사', '어제 16:05'],
    ['최*민', '2024****56', 41, 6, 18, '형용사 성 일치', '어제 14:32'],
    ['정*서', '2025****72', 88, 14, 12, '전치사', '11.20'],
  ],
  writing: [
    ['김*윤', '2025****11', 74, 10, 29, '과거형 시제', '오늘 10:28'],
    ['박*은', '2024****28', 69, 8, 24, '문장 연결', '오늘 09:06'],
    ['이*아', '2025****04', 58, 7, 27, '형용사 성·수 일치', '어제 16:21'],
    ['최*민', '2024****56', 46, 5, 19, '어순', '어제 14:10'],
    ['정*서', '2025****72', 81, 11, 15, '과거형 동사', '11.20'],
  ],
  speaking: [
    ['김*윤', '2025****11', 71, 11, 26, '정중한 주문 표현', '오늘 10:36'],
    ['박*은', '2024****28', 62, 8, 32, '가격 질문', '오늘 09:12'],
    ['이*아', '2025****04', 55, 7, 23, '발음·강세', '어제 16:42'],
    ['최*민', '2024****56', 43, 6, 21, '응답 이어가기', '어제 14:47'],
    ['정*서', '2025****72', 84, 13, 14, '관사 선택', '11.20'],
  ],
};

export function Overview({ onNavigate }: Props) {
  const { filters } = useProfFilters();
  const subject = subjectNames[filters.course];
  const scope = getDemoState().scopes.find(scope =>
    scope.week === filters.week &&
    scope.subject === subject &&
    (scope.section ?? '01') === filters.section &&
    ['active', 'ended', 'scheduled'].includes(scope.status),
  );
  const sectionSize = filters.section === '01' ? 48 : 32;
  const studentRows = filters.section === '01' ? studentsByCourse[filters.course] : [];
  const participation = scope ? Math.round(sectionSize * scope.participation / 100) : 0;
  const averageProgress = scope ? progressByCourse[filters.course][filters.week] ?? 0 : 0;
  const averageError = scope ? 100 - scope.accuracy : 0;
  const feedbackCount = filters.section === '01'
    ? getDemoState().feedback.filter(item =>
      item.status === 'open' &&
      item.week === `${filters.week}주차` &&
      item.subject === filters.course,
    ).length
    : 0;

  return (
    <div className="prof-page">
      <header className="prof-page-head">
        <div>
          <span className="eyebrow">PORTUGUÊS A1 · {filters.section}분반</span>
          <h1>
            반 현황 · {scope?.topic || subject}
            {scope?.status === 'active' ? ' · 진행 중' : scope?.status === 'scheduled' ? ' · 예약' : ''}
          </h1>
          <p>{filters.week}주차 · {weekDates[filters.week] ?? ''} · {subject} · 수강생 {sectionSize}명</p>
        </div>
      </header>

      <section className="prof-kpis">
        <article>
          <span>참여 학생</span>
          <b>{participation} <small>/ {sectionSize}</small></b>
          <em className="good">선택한 과목·분반 기준</em>
        </article>
        <article>
          <span>평균 진행률</span>
          <b>{averageProgress}<small>%</small></b>
          <em>선택 주차 평균</em>
        </article>
        <article>
          <span>평균 오답률</span>
          <b>{averageError}<small>%</small></b>
          <em>선택한 범위 정확도 기준</em>
        </article>
        <button type="button" onClick={() => onNavigate('/prof/feedback')}>
          <span>피드백 신고</span>
          <b>{feedbackCount}<small>건</small></b>
          <em className="warn">확인 필요</em>
        </button>
      </section>

      <section className="prof-card roster-card">
        <div className="section-title">
          <div>
            <h2>학생별 연습 현황</h2>
            <p>{subject} · {filters.section}분반 · 이름·학번 일부 가림</p>
          </div>
          <button className="text-link" onClick={() => onNavigate('/prof/students')}>전체 보기 →</button>
        </div>
        <div className="table-scroll">
          <table className="prof-table">
            <thead>
              <tr>
                <th>학생</th>
                <th>진행률</th>
                <th>연습</th>
                <th>오답률</th>
                <th>주요 오류</th>
                <th>최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.length ? studentRows.map(([name, id, progress, practices, error, weakness, lastActivity]) => (
                <tr key={id}>
                  <td><b>{name}</b><small>{id}</small></td>
                  <td><span className="mini-progress"><i style={{ width: `${progress}%` }} /></span>{progress}%</td>
                  <td>{practices}회</td>
                  <td><strong className={error >= 30 ? 'text-danger' : ''}>{error}%</strong></td>
                  <td>{weakness}</td>
                  <td>{lastActivity}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>선택한 분반의 시연 학생 기록이 아직 없어요.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="privacy-note">학생 데이터는 수업 지원 목적으로만 사용되며, 시범 사용에 동의한 학생만 표시돼요.</p>
      </section>
    </div>
  );
}
