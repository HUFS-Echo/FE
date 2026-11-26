import { mockRequest, fail } from './client';
import { READING_QUESTIONS, WEEK } from '../config/learning';
import { WRITING_READING_QUESTIONS } from '../config/writingReadingPractice';
import { SPEAKING_PRACTICE_QUESTIONS } from '../config/speakingPractice';
import type { AnswerResponse, PracticeSet, PracticeSummary, Question, SubmitResponse } from './types';
function questionsFor(setId: number): Question[] {
  const source = setId % 10 === 2 ? WRITING_READING_QUESTIONS : setId % 10 === 3 ? SPEAKING_PRACTICE_QUESTIONS : READING_QUESTIONS;
  const grammarFormats = ['FORM_WRITE', 'FILL_BLANK', 'FIX_PART', 'REWRITE', 'MULTIPLE_CHOICE'] as const;
  const writingFormats = ['FIND_INFO', 'FIND_PURPOSE', 'WRITE_REQUIRED', 'REPLY', 'MULTIPLE_CHOICE'] as const;
  const speakingFormats = ['LISTEN', 'REPLY_LINE', 'SPEAK', 'READ_ALOUD', 'MULTIPLE_CHOICE'] as const;
  return source.map((item, index) => {
    const format = (setId % 10 === 2 ? writingFormats : setId % 10 === 3 ? speakingFormats : grammarFormats)[index];
    const choice = ('responseType' in item ? item.responseType === 'choice' : item.type === 'choice');
    const audio = 'responseType' in item && item.responseType === 'recording';
    return {
      questionId: setId * 10 + index + 1,
      format,
      sentence: item.prompt,
      choices: item.options ?? null,
      answer: item.answer,
      explanation: item.explanation,
      sourcePage: 29 + index,
      instruction: item.instruction,
      typeLabel: item.label,
      answerType: audio ? 'AUDIO' as const : choice ? 'CHOICE' as const : 'TEXT' as const,
      prompt: 'promptType' in item ? item.promptType : null,
    };
  });
}
/** B3 GET /practice-sets/{setId} — Bearer(학생만) */
export function getPracticeSet(setId: number) { return mockRequest<PracticeSet>('B3', () => ({ setId, title: '이번 주 연습', week: WEEK.no, textbook: { materialId: 1, title: 'Português A1', page: 29, pageImageUrl: null }, currentIndex: 0, questions: questionsFor(setId) })); }
/** B4 POST /practice-sets/{setId}/questions/{questionId}/answers — Bearer(학생만) */
export function answerPracticeQuestion(setId: number, questionId: number, answer: string) { return mockRequest<AnswerResponse>('B4', () => {
  if (!answer.trim()) fail(400, 'INVALID_INPUT', '답을 입력해 주세요.');
  const question = questionsFor(setId).find((item) => item.questionId === questionId) ?? questionsFor(setId)[0];
  const correct = answer.trim().toLowerCase() === question.answer.toLowerCase();
  return { correct, answer, correctAnswer: question.answer, correction: correct ? null : { correctionId: questionId, week: WEEK.no, tag: '관사', original: question.sentence, corrected: question.sentence.replace('___', question.answer), explanation: question.explanation ?? '', createdAt: new Date().toISOString() }, isLast: false, explanation: question.explanation };
}); }
/** B5 POST /practice-sets/{setId}/questions/{questionId}/transcriptions — Bearer(학생만), multipart mock */
export function transcribePracticeAnswer(setId: number, questionId: number, _audio?: Blob) { return mockRequest('B5', () => ({ transcriptionId: 12, text: questionsFor(setId).find((question) => question.questionId === questionId)?.answer ?? '', durationSec: 3.1 })); }
/** B6 POST /practice-sets/{setId}/submit — Bearer(학생만) */
export function submitPracticeSet(setId: number, answers: Array<{ questionId: number; text?: string; choice?: string; transcriptionId?: number }>, elapsedSeconds = 180) { return mockRequest<SubmitResponse>('B6', () => {
  const questions = questionsFor(setId);
  const results = questions.map((question, index) => { const given = answers.find((item) => item.questionId === question.questionId); const myAnswer = given?.choice ?? given?.text ?? (given?.transcriptionId ? 'O meu jardim é grande.' : ''); return { questionId: question.questionId, number: index + 1, format: question.format, formatLabel: question.typeLabel ?? '문제 풀이', myAnswer, correct: myAnswer.toLocaleLowerCase() === question.answer.toLocaleLowerCase(), answer: question.answer, explanation: question.explanation ?? '정답과 표현을 확인해 보세요.' }; });
  return { results, summary: { correctCount: results.filter((result) => result.correct).length, total: results.length, elapsedMinutes: Math.max(1, Math.round(elapsedSeconds / 60)) } };
}); }
/** B7 POST /practice-sets/{setId}/complete — Bearer(학생만) */
export function completePracticeSet(setId: number, elapsedSeconds = 180, correctCount = 4, total = 5) { return mockRequest<{ summary: PracticeSummary }>('B7', () => ({ summary: { subject: setId % 10 === 2 ? 'WRITING' : setId % 10 === 3 ? 'SPEAKING' : 'GRAMMAR', eyebrow: `LEITURA · ${WEEK.no}주차`, title: 'Muito bem!', message: setId % 10 === 2 ? '작문·독해 5문항을 풀고 예시 답안과 해설을 확인했어요.' : setId % 10 === 3 ? '회화 5문항을 풀고 예시 답안과 해설을 확인했어요.' : `문법 ${total}문제를 모두 풀었어요. 오늘의 결과를 확인해 보세요.`, stats: [{ label: '정답', value: correctCount, suffix: `/ ${total}` }, { label: '정확도', value: Math.round(correctCount / total * 100), suffix: '%' }, { label: '연습 시간', value: Math.max(1, Math.round(elapsedSeconds / 60)), suffix: '분' }], corrections: [] } })); }
