import { useEffect, useState } from 'react';
import { useProfFilters } from './ProfFilterContext';

type Props = { onToast: (message: string) => void };
type ReportRow = {
  name: string;
  count: number;
  rate: number;
  bad: string;
  good: string;
  examples: string[];
  students: string[];
};

const grammarRows: ReportRow[] = [
  { name: '관사와 명사의 성·수 일치', count: 19, rate: 42, bad: 'uma café', good: 'um café', examples: ['Eu quero uma café.', 'A conta são oito euros.'], students: ['김*윤', '박*은', '이*아'] },
  { name: '전치사 축약 em + a / a + a', count: 14, rate: 31, bad: 'no mesa', good: 'na mesa', examples: ['O menu está no mesa.', 'Eu vou a a loja.'], students: ['최*민', '정*서'] },
  { name: 'ser / estar 구분', count: 9, rate: 24, bad: 'Eu sou cansada.', good: 'Eu estou cansada.', examples: ['Hoje sou cansado.', 'A loja é fechada agora.'], students: ['박*은', '김*윤'] },
  { name: '형용사 성 일치', count: 7, rate: 18, bad: 'festa divertido', good: 'festa divertida', examples: ['A comida é gostoso.', 'Uma cidade bonito.'], students: ['이*아', '최*민'] },
];

const writingRows: ReportRow[] = [
  { name: '과거형 시제 일관성', count: 16, rate: 38, bad: 'Eu vou à festa ontem.', good: 'Eu fui à festa ontem.', examples: ['Eu estudei e depois vou dormir.', 'Nós foi ao mercado.'], students: ['김*윤', '박*은'] },
  { name: '문장 연결', count: 12, rate: 30, bad: 'Eu gostei. A festa foi boa.', good: 'Eu gostei porque a festa foi boa.', examples: ['A comida estava boa. Eu comi muito.', 'Eu fui à festa. Eu encontrei meus amigos.'], students: ['이*아', '최*민'] },
  { name: '형용사 성·수 일치', count: 9, rate: 24, bad: 'A festa foi divertido.', good: 'A festa foi divertida.', examples: ['As comidas estavam bom.', 'Meus amigas estavam felizes.'], students: ['박*은', '정*서'] },
  { name: '장소·시간 표현', count: 7, rate: 18, bad: 'Eu fui em sábado.', good: 'Eu fui no sábado.', examples: ['A festa foi na escola em sábado.', 'Eu cheguei para oito horas.'], students: ['이*아', '최*민'] },
];

const speakingRows: ReportRow[] = [
  { name: '정중한 주문 표현', count: 15, rate: 36, bad: 'Quero café.', good: 'Queria um café, por favor.', examples: ['Me dá água.', 'Quero conta.'], students: ['김*윤', '박*은'] },
  { name: '가격 질문·응답', count: 12, rate: 30, bad: 'Quanto?', good: 'Quanto custa?', examples: ['É muito?', 'Custa quanto isso?'], students: ['이*아', '정*서'] },
  { name: '주문 내용 구체화', count: 9, rate: 24, bad: 'Quero açaí.', good: 'Quero um açaí pequeno com morango.', examples: ['Eu quero café grande.', 'Com banana.'], students: ['박*은', '최*민'] },
  { name: '대화 마무리 표현', count: 7, rate: 18, bad: 'Tchau.', good: 'Obrigado. Até logo!', examples: ['Obrigado, tchau.', 'Valeu.'], students: ['이*아', '정*서'] },
];

const summaries = {
  reading: {
    title: '관사와 명사의 성·수 일치 오류가 가장 많이 반복됐어요.',
    description: '학생들은 부정관사 um/uma의 형태는 알고 있지만, 뒤에 오는 명사의 성·수와 맞추는 과정에서 실수해요. 전치사 축약 오류는 지난주보다 늘어 짧은 문장 연습이 효과적일 것으로 보여요.',
  },
  writing: {
    title: '과거형 시제 일관성 오류가 가장 많이 반복됐어요.',
    description: '학생들은 과거 경험을 쓰면서 문장마다 시제를 일관되게 유지하는 과정에서 실수해요. 시간 순서에 따라 문장을 연결하고 형용사 성·수를 확인하는 글쓰기 연습이 도움이 될 것 같아요.',
  },
  speaking: {
    title: '정중한 주문 표현과 가격 질문을 더 연습해야 해요.',
    description: '학생들은 원하는 메뉴를 말하는 데는 익숙하지만, 정중한 요청이나 가격 질문을 자연스럽게 이어 가는 데 어려움이 있어요. 짧은 역할극으로 주문부터 감사 인사까지 연습하면 효과적일 것으로 보여요.',
  },
};

export function WeaknessReport({ onToast }: Props) {
  const { filters } = useProfFilters();
  const [summaryReady, setSummaryReady] = useState(false);
  useEffect(() => {
    setSummaryReady(false);
    const timer = window.setTimeout(() => setSummaryReady(true), 1000);
    return () => window.clearTimeout(timer);
  }, [filters.course, filters.section, filters.week]);

  const subjectLabel = {
    reading: '포르투갈어 문법',
    writing: '포르투갈어 읽기와 쓰기',
    speaking: '포르투갈어 회화',
  }[filters.course];
  const weekDates = { 1: '11.03–11.09', 2: '11.10–11.16', 3: '11.17–11.23', 4: '11.24–11.30', 5: '12.01–12.07' }[filters.week];
  const reportRows = filters.section === '02' ? [] : filters.course === 'reading' ? grammarRows : filters.course === 'writing' ? writingRows : speakingRows;
  const summary = summaries[filters.course];
  const trendRows = reportRows.slice(0, 4).map((row) => ({
    name: row.name,
    week1: Math.min(99, row.rate + 8),
    week2: Math.min(99, row.rate + 4),
    week3: row.rate,
  }));
  const [open, setOpen] = useState(0);
  const [selected, setSelected] = useState<string[]>(reportRows.slice(0, 2).map((row) => row.name));
  useEffect(() => {
    setOpen(0);
    setSelected(reportRows.slice(0, 2).map((row) => row.name));
  }, [filters.course, filters.section]);

  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const selectedRows = reportRows.filter((row) => selected.includes(row.name));
  const generatedExamples = Array.from({ length: selectedRows.length ? 5 : 0 }, (_, index) =>
    index % 2 === 0
      ? selectedRows[index % selectedRows.length].good
      : selectedRows[index % selectedRows.length].examples[Math.floor(index / 2) % selectedRows[index % selectedRows.length].examples.length],
  );
  const toggle = (name: string) => setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  function make() {
    setBusy(true);
    setReady(false);
    window.setTimeout(() => {
      setBusy(false);
      setReady(true);
      setModal(true);
    }, 1050);
  }

  return (
    <div className="prof-page">
      <header className="prof-page-head">
        <div>
          <span className="eyebrow">WEEKLY WEAKNESS REPORT</span>
          <h1>취약점 리포트</h1>
          <p>{filters.week}주차 · {weekDates} · {subjectLabel} · {filters.section}분반</p>
        </div>
        <button className="btn-ghost" onClick={() => window.print()}>인쇄 / PDF 내보내기</button>
      </header>

      {summaryReady ? (
        <section className="prof-ai-card report-summary">
          <div className="ai-avatar"><img src="/owls/football.png" alt=""/><b>AI</b></div>
          <div className="prof-ai-card__body">
            <span className="eyebrow">AI 주간 분석</span>
            <h2>{summary.title}</h2>
            <p>{summary.description}</p>
          </div>
        </section>
      ) : (
        <section className="prof-ai-card report-summary">
          <div className="ai-avatar"><img src="/owls/football.png" alt=""/><b>AI</b></div>
          <div className="prof-ai-card__body">
            <span className="eyebrow">AI 주간 분석</span>
            <h2>AI가 선택한 조건을 분석하고 있어요…</h2>
            <p>과목·분반·주차별 시연 데이터를 살펴보는 중입니다.</p>
          </div>
        </section>
      )}

      <section className="prof-card">
        <div className="section-title">
          <div><h2>상위 오류 주차별 추이</h2><p>오답률 변화 · {filters.week}주차 · {subjectLabel} · 최근 추이</p></div>
        </div>
        {trendRows.length ? (
          <div className="trend-chart">
            {trendRows.map((row) => (
              <div className="trend-row" key={row.name}>
                <b>{row.name}</b>
                <span style={{ width: `${row.week1 * 1.3}%` }}>{row.week1}%</span>
                <span style={{ width: `${row.week2 * 1.3}%` }}>{row.week2}%</span>
                <span style={{ width: `${row.week3 * 1.3}%` }}>{row.week3}%</span>
              </div>
            ))}
            <div className="trend-legend"><i/>1주차 <i/>2주차 <i/>3주차</div>
          </div>
        ) : <div className="prof-empty"><span>!</span><div><b>02분반 취약점 데이터가 아직 없어요</b><p>데이터가 준비되면 주차별 리포트가 표시됩니다.</p></div></div>}
      </section>

      <section className="prof-card">
        <div className="section-title">
          <div><h2>오류 유형 상세</h2><p>오류를 펼쳐 대표 예시와 학생을 확인하세요.</p></div>
          <button className="btn-solid" onClick={make} disabled={!selected.length || busy}>{busy ? '예문 만드는 중…' : '다음 수업 자료 만들기'}</button>
        </div>
        <div className="weakness-list">
          {reportRows.length ? reportRows.map((row, index) => (
            <article className="weakness-item" key={row.name}>
              <button className="weakness-item__head" onClick={() => setOpen(open === index ? -1 : index)}>
                <input type="checkbox" checked={selected.includes(row.name)} onChange={() => toggle(row.name)} onClick={(event) => event.stopPropagation()}/>
                <span className="rank">0{index + 1}</span><b>{row.name}</b><span>{row.count}명</span><strong>{row.rate}%</strong><i>{open === index ? '−' : '＋'}</i>
              </button>
              <div className="correction-pair"><span className="strike">{row.bad}</span><span>→</span><b>{row.good}</b><small>다음 수업에 반영</small></div>
              {open === index && (
                <div className="weakness-examples">
                  <b>추가 오답 예시</b>
                  {row.examples.map((example) => <p key={example}>“{example}”</p>)}
                  <b>해당 학생</b><p>{row.students.join(' · ')}</p>
                </div>
              )}
            </article>
          )) : <div className="prof-empty"><span>!</span><div><b>02분반 취약점 데이터가 아직 없어요</b><p>데이터가 준비되면 주차별 리포트가 표시됩니다.</p></div></div>}
        </div>
      </section>

      {modal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModal(false)}>
          <section className="simple-modal" role="dialog" aria-modal="true" aria-label="복습 자료 미리보기" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(false)}>×</button>
            <span className="ai-pill">✦ AI 생성 · 데모</span>
            <h2>다음 수업 복습 예문</h2>
            <p>선택한 오류 유형 {selected.length}개를 바탕으로 만들었어요.</p>
            {ready && generatedExamples.map((example, index) => <p className="generated-line" key={`${index}-${example}`}><b>{index + 1}.</b> {example}</p>)}
            <div className="prof-actions">
              <button className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(generatedExamples.join('\n')); onToast('선택한 오류 유형을 반영한 예문을 복사했어요.'); }}>복사</button>
              <button className="btn-solid" onClick={() => window.print()}>PDF로 내보내기</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
