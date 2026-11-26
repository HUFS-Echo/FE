import { CORRECTION_HISTORY } from '../config/learning';
import { mockRequest, fail } from './client';
import type { CustomAnswerResult, CustomPractice, CustomPracticeQuestion } from './types';
const key = (practiceId: number) => `hufs-echo.custom-practice.${practiceId}.v1`;
/** B9 POST /student/custom-practice — Bearer(학생만) */
export function createCustomPractice(_courseId: number | null = null, size = 5) { return mockRequest<CustomPractice>('B9', () => {
  const id = Date.now();
  const questions: CustomPracticeQuestion[] = CORRECTION_HISTORY.slice(0, Math.max(1, size)).map((item, index) => ({ questionId: index + 1, tag: item.tag, courseTitle: item.subject === 'reading' ? '포르투갈어 문법' : item.subject === 'writing' ? '포르투갈어 읽기와 쓰기' : '포르투갈어 회화', repeatCount: item.repeat, instruction: '이전에 틀렸던 표현과 비슷한 새 문제예요. 알맞은 표현을 골라 보세요.', sentence: item.original, choices: [item.corrected, item.original, 'Eu quero água.', 'Eu quero os café.'], explanation: item.explanation }));
  const data = { practiceId: id, questions, answers: {}, currentIndex: 0 };
  localStorage.setItem(key(id), JSON.stringify(data));
  return { practiceId: id, questions };
}); }
/** Read and resume a stored mock set by stable practiceId. */
export function getCustomPractice(practiceId: number) { try { const saved = JSON.parse(localStorage.getItem(key(practiceId)) ?? 'null') as { practiceId: number; questions: CustomPracticeQuestion[] } | null; return saved?.practiceId === practiceId ? saved : null; } catch { return null; } }
/** B10 POST /student/custom-practice/{practiceId}/questions/{questionId}/answers — Bearer(학생만) */
export function answerCustomPractice(practiceId: number, questionId: number, answer: string) { return mockRequest<CustomAnswerResult>('B10', () => {
  if (!answer.trim()) fail(400, 'INVALID_INPUT', '문장을 입력해 주세요.');
  const set = getCustomPractice(practiceId);
  if (!set) fail(404, 'PRACTICE_NOT_FOUND', '맞춤 연습을 찾을 수 없어요.');
  const question = set.questions.find((item) => item.questionId === questionId);
  if (!question) fail(404, 'QUESTION_NOT_FOUND', '문제를 찾을 수 없어요.');
  const correct = answer === question.choices[0];
  const answers = JSON.parse(localStorage.getItem(key(practiceId)) ?? '{}') as { answers?: Record<string, string>; currentIndex?: number };
  answers.answers = { ...answers.answers, [String(questionId)]: answer };
  answers.currentIndex = Math.max(answers.currentIndex ?? 0, questionId);
  localStorage.setItem(key(practiceId), JSON.stringify({ ...set, ...answers }));
  const isLast = questionId >= set.questions.length;
  const correctCount = Object.values(answers.answers).reduce((total, value, index) => total + Number(value === set.questions[index]?.choices[0]), 0);
  return { correct, correctAnswer: question.choices[0], isLast, result: isLast ? { correctCount, total: set.questions.length } : null, explanation: question.explanation };
}); }
