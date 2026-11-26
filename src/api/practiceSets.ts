import { mockRequest, fail } from './client';
import { READING_QUESTIONS, WEEK } from '../config/learning';
import { WRITING_READING_QUESTIONS } from '../config/writingReadingPractice';
import { SPEAKING_PRACTICE_QUESTIONS } from '../config/speakingPractice';
import type { AnswerResponse, PracticeSet, PracticeSummary, Question, SubmitResponse } from './types';
function questionsFor(setId: number): Question[] {
  const source = setId % 10 === 2 ? WRITING_READING_QUESTIONS : setId % 10 === 3 ? SPEAKING_PRACTICE_QUESTIONS : READING_QUESTIONS;
  return source.map((item, index) => ({ questionId: setId * 10 + index + 1, format: 'MULTIPLE_CHOICE', sentence: item.prompt, choices: item.options ?? null, answer: item.answer, explanation: item.explanation, sourcePage: 29 + index, instruction: item.instruction, typeLabel: item.label }));
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
export function transcribePracticeAnswer(_setId: number, _questionId: number, _audio?: Blob) { return mockRequest('B5', () => ({ transcriptionId: 12, text: 'O meu jardim é grande.', durationSec: 3.1 })); }
/** B6 POST /practice-sets/{setId}/submit — Bearer(학생만) */
export function submitPracticeSet(setId: number, answers: Array<{ questionId: number; text?: string; choice?: string; transcriptionId?: number }>, elapsedSeconds = 180) { return mockRequest<SubmitResponse>('B6', () => {
  const questions = questionsFor(setId);
  const results = questions.map((question, index) => { const given = answers.find((item) => item.questionId === question.questionId); const myAnswer = given?.choice ?? given?.text ?? ''; return { questionId: question.questionId, number: index + 1, format: question.format, formatLabel: question.typeLabel ?? '문제 풀이', myAnswer, correct: myAnswer.toLowerCase() === question.answer.toLowerCase(), answer: question.answer, explanation: question.explanation ?? '정답과 표현을 확인해 보세요.' }; });
  return { results, summary: { correctCount: results.filter((result) => result.correct).length, total: results.length, elapsedMinutes: Math.max(1, Math.round(elapsedSeconds / 60)) } };
}); }
/** B7 POST /practice-sets/{setId}/complete — Bearer(학생만) */
export function completePracticeSet(setId: number, elapsedSeconds = 180, correctCount = 4, total = 5) { return mockRequest<{ summary: PracticeSummary }>('B7', () => ({ summary: { subject: setId % 10 === 2 ? 'WRITING' : setId % 10 === 3 ? 'SPEAKING' : 'GRAMMAR', eyebrow: `LEITURA · ${WEEK.no}주차`, title: 'Muito bem!', message: '이번 주 연습을 마쳤어요.', stats: [{ label: '정답', value: correctCount, suffix: `/ ${total}` }, { label: '정확도', value: Math.round(correctCount / total * 100), suffix: '%' }, { label: '연습 시간', value: Math.max(1, Math.round(elapsedSeconds / 60)), suffix: '분' }], corrections: [] } })); }
