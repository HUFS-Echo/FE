import { useEffect, useState, type ReactNode } from 'react';
import { WEEK, WRITING_TASK, type WritingCorrection } from '../../../config/learning';
import type { SummaryData } from './PracticeSummary';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

type Mode = 'draft' | 'correction';

export function WritingPractice({ onBack, onComplete, onToast }: Props) {
  const [draft, setDraft] = useState(WRITING_TASK.initialDraft);
  const [mode, setMode] = useState<Mode>('draft');
  const [saved, setSaved] = useState<'saving' | 'saved'>('saved');
  const [applied, setApplied] = useState<string[]>([]);

  useEffect(() => {
    setSaved('saving');
    const timer = window.setTimeout(() => setSaved('saved'), 700);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const sentences = draft.split(/[.!?]+/).filter((sentence) => sentence.trim()).length;
  const checklist = WRITING_TASK.checklist.map((item) => ({
    ...item,
    checked: item.keywords.some((keyword) => draft.toLowerCase().includes(keyword)),
  }));

  function applyCorrection(correction: WritingCorrection) {
    if (!draft.includes(correction.original)) {
      onToast('이미 반영되었거나 문장에서 찾을 수 없어요.');
      return;
    }
    setDraft((value) => value.replace(correction.original, correction.corrected));
    setApplied((items) => (items.includes(correction.id) ? items : [...items, correction.id]));
    onToast('교정을 초안에 반영했어요.');
  }

  function applyAll() {
    let nextDraft = draft;
    for (const correction of WRITING_TASK.corrections) {
      nextDraft = nextDraft.replace(correction.original, correction.corrected);
    }
    setDraft(nextDraft);
    setApplied(WRITING_TASK.corrections.map((correction) => correction.id));
    onToast('교정 카드 3개를 모두 반영했어요.');
  }

  function reset() {
    setDraft(WRITING_TASK.initialDraft);
    setApplied([]);
    setMode('draft');
    onToast('처음 초안으로 돌아왔어요.');
  }

  function insertExpression(expression: string) {
    setDraft((value) => `${value.trim()} ${expression}.`);
    onToast('표현을 초안 끝에 넣었어요.');
  }

  function submit() {
    if (!draft.trim()) {
      onToast('먼저 한 문장 이상 써 주세요.');
      return;
    }
    const accuracy = Math.max(60, 100 - WRITING_TASK.corrections.length * 8);
    onComplete({
      subject: 'writing',
      eyebrow: `ESCRITA · ${WEEK.label}`,
      title: 'Muito bem!',
      message: '학교 파티 일기를 완성했어요. 교정 카드를 반영한 문장을 다시 읽어 볼까요?',
      stats: [
        { label: '작성 문장', value: `${sentences}`, suffix: '문장' },
        { label: '교정', value: `${WRITING_TASK.corrections.length}`, suffix: '개' },
        { label: '정확도', value: `${accuracy}`, suffix: '%' },
      ],
      corrections: WRITING_TASK.corrections.map((correction) => ({
        original: correction.original,
        corrected: correction.corrected,
        tag: correction.tag,
      })),
      words: ['festa', 'bolo', 'dançar', 'amigo'],
      next: {
        title: '회화 · 카페 미션',
        desc: '오늘 쓴 표현을 말로도 연습해 보세요.',
        cta: '회화로 이동',
        subject: 'speaking',
      },
    });
  }

  return (
    <div className="writing">
      <div className="writing__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon />
          연습 홈
        </button>
        <div className="writing__top-title">
          <span className="chip chip--amber">작문</span>
          <b>{WRITING_TASK.title}</b>
          <span className="chip">{WRITING_TASK.range}</span>
        </div>
        <div className="mode-toggle" role="tablist" aria-label="초안과 교정 결과">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'draft'}
            className={mode === 'draft' ? 'is-active' : ''}
            onClick={() => setMode('draft')}
          >
            초안
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'correction'}
            className={mode === 'correction' ? 'is-active' : ''}
            onClick={() => setMode('correction')}
          >
            교정 결과
          </button>
        </div>
      </div>

      <div className="writing__grid">
        <aside className="writing-task">
          <p className="eyebrow">TAREFA · {WEEK.label}</p>
          <h1>{WRITING_TASK.title}</h1>
          <p className="writing-task__prompt">{WRITING_TASK.prompt}</p>

          <div className="writing-task__meta">
            <div>
              <span>권장 분량</span>
              <b>{WRITING_TASK.length}</b>
            </div>
            <div>
              <span>범위</span>
              <b>{WRITING_TASK.range}</b>
            </div>
            <div>
              <span>마감</span>
              <b>{WRITING_TASK.deadline}</b>
            </div>
          </div>

          <div className="writing-task__block">
            <p className="writing-task__label">꼭 넣을 내용</p>
            <ul className="writing-checklist">
              {checklist.map((item) => (
                <li key={item.id} className={item.checked ? 'is-checked' : ''}>
                  <span className="writing-checklist__box" aria-hidden="true">
                    {item.checked && <CheckIcon />}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="writing-task__auto">작성한 내용에서 자동으로 확인했어요.</p>
          </div>

          <div className="writing-task__block">
            <p className="writing-task__label">쓸 수 있는 표현</p>
            <div className="expression-chips">
              {WRITING_TASK.expressions.map((expression) => (
                <button key={expression} type="button" onClick={() => insertExpression(expression)}>
                  {expression}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="writing-editor">
          <div className="editor-toolbar">
            <span className={`editor-saved ${saved === 'saving' ? 'is-saving' : ''}`}>
              <i aria-hidden="true" />
              {saved === 'saving' ? '저장 중...' : '자동 저장됨'}
            </span>
            <span className="editor-count">
              {words}단어 · {sentences}문장
            </span>
          </div>

          <div className="editor-paper">
            <div className="editor-paper__head">
              <span>DIÁRIO · {WEEK.label}</span>
              <span>PT-WRITE1</span>
            </div>
            {mode === 'draft' ? (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="작문 초안"
                spellCheck={false}
              />
            ) : (
              <div className="editor-paper__text">{renderWithErrors(draft)}</div>
            )}

            {mode === 'correction' && (
              <div className="editor-paper__strength">
                <p className="eyebrow">PONTOS FORTES</p>
                <b>잘한 점</b>
                <ul>
                  {WRITING_TASK.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="editor-paper__foot">
              <span>{mode === 'draft' ? '초안을 쓰면 자동으로 저장돼요.' : '빨간 밑줄은 오른쪽 교정 카드에서 확인하세요.'}</span>
              <span>{words} / 120</span>
            </div>
          </div>

          <div className="writing-editor__actions">
            <button type="button" className="btn-ghost" onClick={reset}>
              다시 써보기
            </button>
            <button type="button" className="btn-solid" onClick={submit}>
              제출하기
              <ArrowIcon />
            </button>
          </div>
        </main>

        <aside className="writing-corrections">
          <header className="writing-corrections__head">
            <div>
              <p className="eyebrow">FEEDBACK</p>
              <h2>교정 카드</h2>
            </div>
            <button type="button" className="text-link" onClick={applyAll}>
              모두 반영
            </button>
          </header>

          <div className="correction-list">
            {WRITING_TASK.corrections.map((correction) => {
              const isApplied = applied.includes(correction.id);
              return (
                <article className={`writing-correction ${isApplied ? 'is-applied' : ''}`} key={correction.id}>
                  <div className="writing-correction__top">
                    <span className="tag">{correction.tag}</span>
                    <span className="writing-correction__state">{isApplied ? '반영됨' : '제안'}</span>
                  </div>
                  <p className="writing-correction__line">
                    <span className="strike">{correction.original}</span>
                    <ArrowIcon />
                    <b>{correction.corrected}</b>
                  </p>
                  <p className="writing-correction__note">{correction.explanation}</p>
                  <button type="button" onClick={() => applyCorrection(correction)} disabled={isApplied}>
                    {isApplied ? '반영 완료' : '반영하기'}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="writing-tip">
            <img src="/owls/suitcase.png" alt="" draggable={false} />
            <div>
              <p className="eyebrow">DICA DO ECHO</p>
              <p>관사는 명사의 성과 수를 먼저 확인하면 헷갈리지 않아요.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function renderWithErrors(text: string): ReactNode[] {
  let nodes: ReactNode[] = [text];
  for (const correction of WRITING_TASK.corrections) {
    nodes = nodes.flatMap((node, nodeIndex) => {
      if (typeof node !== 'string') return [node];
      const parts = node.split(correction.original);
      if (parts.length === 1) return [node];
      const output: ReactNode[] = [];
      parts.forEach((part, partIndex) => {
        if (partIndex > 0) {
          output.push(
            <span className="writing__err" key={`${correction.id}-${nodeIndex}-${partIndex}`}>
              {correction.original}
            </span>,
          );
        }
        if (part) output.push(part);
      });
      return output;
    });
  }
  return nodes;
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13 8H4M7.5 4.5 4 8l3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.5 3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
