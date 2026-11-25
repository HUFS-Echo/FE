import { useMemo, useState } from 'react';
import { CORRECTION_HISTORY, getSubject, type HistoryItem } from '../../../config/learning';

type Props = {
  onBack: () => void;
};

type QuestionTemplate = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

type PracticeQuestion = QuestionTemplate & {
  tag: string;
  subject: HistoryItem['subject'];
  repeat: number;
};

const QUESTION_TEMPLATES: Record<string, QuestionTemplate[]> = {
  관사: [
    {
      id: 'article-book',
      prompt: 'Eu comprei ___ livro para a aula.',
      choices: ['uma', 'um', 'uns'],
      answer: 'um',
      explanation: 'livro는 남성 단수 명사이므로 남성 단수 부정관사 um을 사용해요.',
    },
    {
      id: 'article-apple',
      prompt: 'Ela comprou ___ maçã na feira.',
      choices: ['um', 'uma', 'umas'],
      answer: 'uma',
      explanation: 'maçã는 여성 단수 명사이므로 여성 단수 부정관사 uma를 사용해요.',
    },
    {
      id: 'article-professor',
      prompt: 'Eles precisam de ___ professor novo.',
      choices: ['um', 'uma', 'uns'],
      answer: 'um',
      explanation: 'professor는 남성 단수 명사이므로 부정관사 um과 함께 써요.',
    },
    {
      id: 'article-films',
      prompt: 'Nós vimos ___ filmes no fim de semana.',
      choices: ['uma', 'uns', 'um'],
      answer: 'uns',
      explanation: 'filmes는 남성 복수 명사이므로 남성 복수 부정관사 uns를 사용해요.',
    },
  ],
  '형용사 성 일치': [
    {
      id: 'adjective-beach',
      prompt: 'A praia é ___ (bonito).',
      choices: ['bonito', 'bonita', 'bonitos'],
      answer: 'bonita',
      explanation: 'praia는 여성 단수 명사라서 형용사도 여성 단수형 bonita로 맞춰요.',
    },
    {
      id: 'adjective-rooms',
      prompt: 'Os quartos são ___ (pequeno).',
      choices: ['pequenas', 'pequeno', 'pequenos'],
      answer: 'pequenos',
      explanation: 'quartos는 남성 복수 명사라서 형용사를 남성 복수형 pequenos로 써요.',
    },
    {
      id: 'adjective-classes',
      prompt: 'As aulas são ___ (interessante).',
      choices: ['interessantes', 'interessante', 'interessantas'],
      answer: 'interessantes',
      explanation: 'aulas는 여성 복수 명사예요. interessante는 성별 변화 없이 복수형 interessants가 아니라 interessantes가 됩니다.',
    },
  ],
  전치사: [
    {
      id: 'preposition-library',
      prompt: 'A estudante vai ___ biblioteca depois da aula.',
      choices: ['ao', 'à', 'na'],
      answer: 'à',
      explanation: 'ir a와 여성 명사 a biblioteca가 만나 a + a = à로 축약돼요.',
    },
    {
      id: 'preposition-chair',
      prompt: 'O livro está ___ cadeira.',
      choices: ['no', 'na', 'à'],
      answer: 'na',
      explanation: '위치를 나타내는 em과 여성 정관사 a가 결합해 em + a = na가 돼요.',
    },
    {
      id: 'preposition-work',
      prompt: 'Eles voltam ___ trabalho às seis.',
      choices: ['à', 'ao', 'na'],
      answer: 'ao',
      explanation: 'voltar a와 남성 정관사 o가 결합해 a + o = ao가 돼요.',
    },
  ],
  '수 일치': [
    {
      id: 'number-bread',
      prompt: 'Dois ___ estão na mesa. (pão)',
      choices: ['pão', 'pães', 'pãos'],
      answer: 'pães',
      explanation: '수량 표현 dois가 있으므로 명사는 복수형이 필요해요. pão의 복수형은 pães입니다.',
    },
    {
      id: 'number-papers',
      prompt: 'Comprei três ___ para a aula. (papel)',
      choices: ['papel', 'papeles', 'papéis'],
      answer: 'papéis',
      explanation: '수량 표현 três 뒤에는 복수형이 와요. papel의 복수형은 papéis입니다.',
    },
    {
      id: 'number-students',
      prompt: 'Há muitos ___ na sala. (aluno)',
      choices: ['alunos', 'aluno', 'alunas'],
      answer: 'alunos',
      explanation: 'muitos는 복수를 나타내므로 명사도 복수형 alunos로 써요.',
    },
  ],
};

function shuffle<T,>(values: T[]): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function buildQuestions(): PracticeQuestion[] {
  const sourcesByTag = new Map<string, HistoryItem[]>();
  for (const item of CORRECTION_HISTORY) {
    if (!QUESTION_TEMPLATES[item.tag]) continue;
    const items = sourcesByTag.get(item.tag) ?? [];
    items.push(item);
    sourcesByTag.set(item.tag, items);
  }

  const errorTypes = [...sourcesByTag.entries()]
    .map(([tag, items]) => ({
      tag,
      items: [...items].sort((a, b) => b.repeat - a.repeat),
      weight: items.reduce((total, item) => total + item.repeat + 1, 0),
    }))
    .sort((a, b) => b.weight - a.weight);

  const templateOffsets = new Map(
    errorTypes.map(({ tag }) => [tag, Math.floor(Math.random() * QUESTION_TEMPLATES[tag].length)]),
  );
  const useCounts = new Map(errorTypes.map(({ tag }) => [tag, 0]));
  const sourceCounts = new Map(errorTypes.map(({ tag }) => [tag, 0]));
  const questions: PracticeQuestion[] = [];

  while (questions.length < 5) {
    const countBeforeRound = questions.length;

    for (const errorType of errorTypes) {
      const templates = QUESTION_TEMPLATES[errorType.tag];
      const useCount = useCounts.get(errorType.tag) ?? 0;
      if (useCount >= templates.length) continue;

      const sourceCount = sourceCounts.get(errorType.tag) ?? 0;
      const templateOffset = templateOffsets.get(errorType.tag) ?? 0;
      const template = templates[(templateOffset + useCount) % templates.length];
      const source = errorType.items[sourceCount % errorType.items.length];

      questions.push({
        ...template,
        id: `custom-${questions.length + 1}-${template.id}`,
        choices: shuffle(template.choices),
        tag: errorType.tag,
        subject: source.subject,
        repeat: source.repeat,
      });
      useCounts.set(errorType.tag, useCount + 1);
      sourceCounts.set(errorType.tag, sourceCount + 1);
      if (questions.length === 5) break;
    }

    if (questions.length === countBeforeRound) break;
  }

  return questions;
}

export function CustomPractice({ onBack }: Props) {
  const questions = useMemo(buildQuestions, []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isChecked = current ? Object.prototype.hasOwnProperty.call(checkedAnswers, current.id) : false;
  const isCorrect = current ? checkedAnswers[current.id] === current.answer : false;
  const correctCount = questions.filter((question) => checkedAnswers[question.id] === question.answer).length;
  const progress = questions.length
    ? (finished ? 100 : ((index + (isChecked ? 1 : 0)) / questions.length) * 100)
    : 0;

  function checkAnswer() {
    if (!current || selected === null || isChecked) return;
    setCheckedAnswers((previous) => ({ ...previous, [current.id]: selected }));
  }

  function moveForward() {
    if (!current || !isChecked) return;
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  return (
    <div className="custom-practice">
      <div className="custom-practice__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon /> 교정 기록으로
        </button>
        <span className="chip chip--blue">오답 유형 맞춤 연습</span>
      </div>

      {!questions.length ? (
        <section className="custom-practice__empty">
          <span className="eyebrow">PERSONAL REVIEW</span>
          <h1>아직 맞춤 문제를 만들 수 없어요</h1>
          <p>교정 기록에 문제가 쌓이면 오류 유형에 맞춘 새 문제를 풀 수 있어요.</p>
          <button type="button" className="btn-solid" onClick={onBack}>교정 기록으로 돌아가기</button>
        </section>
      ) : finished ? (
        <>
          <header className="custom-practice__hero custom-practice__hero--complete">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · COMPLETE</span>
              <h1>맞춤 연습을 마쳤어요</h1>
              <p>문항별 정답과 해설을 확인해 보세요. 이번 결과는 저장되지 않습니다.</p>
            </div>
            <div className="custom-practice__score" aria-label={`정답 ${correctCount}개, 전체 ${questions.length}문제`}>
              <b>{correctCount}<small> / {questions.length}</small></b>
              <span>정답</span>
            </div>
          </header>

          <section className="custom-practice__results" aria-label="맞춤 연습 결과와 해설">
            {questions.map((question, questionIndex) => {
              const answer = checkedAnswers[question.id];
              const answerIsCorrect = answer === question.answer;
              return (
                <article className="custom-practice__result-row" key={question.id}>
                  <span
                    className={`custom-practice__result-mark ${answerIsCorrect ? 'is-correct' : 'is-wrong'}`}
                    aria-label={answerIsCorrect ? '정답' : '오답'}
                  >
                    {answerIsCorrect ? '✓' : '×'}
                  </span>
                  <div className="custom-practice__result-content">
                    <b>{questionIndex + 1}번 · {question.tag} · {getSubject(question.subject).name}</b>
                    <p className="custom-practice__result-prompt">{question.prompt}</p>
                    <p className="custom-practice__result-answer">
                      <span>내 답</span>
                      <strong className={answerIsCorrect ? 'is-correct' : 'is-wrong'}>{answer}</strong>
                      {!answerIsCorrect && <><span>정답</span><strong className="is-correct">{question.answer}</strong></>}
                    </p>
                    <p className="custom-practice__result-explanation">{question.explanation}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="custom-practice__actions">
            <button type="button" className="btn-solid" onClick={onBack}>맞춤 연습 마치기</button>
          </div>
        </>
      ) : current ? (
        <>
          <header className="custom-practice__hero">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · PRACTICE</span>
              <h1>오답 유형으로 새 문제를 풀어봐요</h1>
              <p>교정 기록에서 확인한 오류 유형과 반복 횟수를 바탕으로 새로운 문제 {questions.length}개를 구성했어요.</p>
            </div>
            <div className="custom-practice__progress-copy">
              <b>{index + 1}<small> / {questions.length}</small></b>
              <span>문제</span>
            </div>
          </header>

          <div className="custom-practice__progress-track" role="progressbar" aria-label="맞춤 연습 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <i style={{ width: `${progress}%` }} />
          </div>

          <section className="custom-practice__question">
            <div className="custom-practice__question-meta">
              <span className="tag">{current.tag}</span>
              <span>{getSubject(current.subject).name}</span>
              {current.repeat > 0 && <b>반복 오류 {current.repeat}회</b>}
            </div>
            <p className="custom-practice__instruction">빈칸에 들어갈 알맞은 표현을 골라주세요.</p>
            <blockquote>{current.prompt}</blockquote>
            <div className="custom-practice__choices" role="group" aria-label="정답 선택지">
              {current.choices.map((choice, choiceIndex) => {
                const isSelected = selected === choice;
                const isRightChoice = isChecked && choice === current.answer;
                const isWrongChoice = isChecked && isSelected && !isCorrect;
                const className = [
                  'custom-practice__choice',
                  isSelected && 'is-selected',
                  isRightChoice && 'is-correct',
                  isWrongChoice && 'is-wrong',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    type="button"
                    className={className}
                    key={choice}
                    onClick={() => setSelected(choice)}
                    disabled={isChecked}
                    aria-pressed={isSelected}
                  >
                    <span className="custom-practice__choice-letter">{String.fromCharCode(65 + choiceIndex)}</span>
                    <span>{choice}</span>
                    {isRightChoice && <b className="custom-practice__choice-label">정답</b>}
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <div className={`custom-practice__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
                <b>{isCorrect ? '정답이에요!' : '아쉬워요. 정답을 확인해 보세요.'}</b>
                {!isCorrect && <p className="custom-practice__correct-answer">정답 · {current.answer}</p>}
                <p>{current.explanation}</p>
              </div>
            )}

            <div className="custom-practice__question-actions">
              {!isChecked ? (
                <button type="button" className="btn-solid" onClick={checkAnswer} disabled={selected === null}>
                  정답 확인
                </button>
              ) : (
                <button type="button" className="btn-solid" onClick={moveForward}>
                  {index === questions.length - 1 ? '결과와 해설 보기' : '다음 문제'}
                  <ArrowIcon />
                </button>
              )}
            </div>
          </section>
          <p className="custom-practice__note">화면 데모 · 맞춤 연습의 답안과 결과는 저장되지 않습니다.</p>
        </>
      ) : null}
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10.5 3 5.5 8l5 5M6 8h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
