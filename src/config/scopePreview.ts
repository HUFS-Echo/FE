import { READING_QUESTIONS, type ReadingQuestion } from './learning';
import { WRITING_READING_QUESTIONS, type WritingReadingQuestion } from './writingReadingPractice';
import { SPEAKING_PRACTICE_QUESTIONS, type SpeakingPracticeQuestion } from './speakingPractice';

export type ScopePreviewSubject =
  | '포르투갈어 문법'
  | '포르투갈어 읽기와 쓰기'
  | '포르투갈어 회화';

export type ScopePreviewExercise = {
  id: string;
  prompt: string;
  answer: string;
  explanation: string;
  page: number;
  options?: string[];
};

type PreviewQuestion = Pick<ReadingQuestion, 'id' | 'label' | 'instruction' | 'prompt' | 'answer' | 'explanation' | 'options'>
  | Pick<WritingReadingQuestion, 'id' | 'label' | 'instruction' | 'prompt' | 'answer' | 'explanation' | 'options'>
  | Pick<SpeakingPracticeQuestion, 'id' | 'label' | 'instruction' | 'prompt' | 'answer' | 'explanation' | 'options'>;

const questionsForSubject = (subject: ScopePreviewSubject): PreviewQuestion[] => {
  if (subject === '포르투갈어 문법') return READING_QUESTIONS;
  if (subject === '포르투갈어 읽기와 쓰기') return WRITING_READING_QUESTIONS;
  return SPEAKING_PRACTICE_QUESTIONS;
};

export function createScopeExercises(
  subject: ScopePreviewSubject,
  fromPage: number,
  toPage: number,
): ScopePreviewExercise[] {
  const questions = questionsForSubject(subject);
  const lastIndex = Math.max(1, questions.length - 1);

  return questions.map((question, index) => ({
    id: question.id,
    prompt: `${question.label} · ${question.instruction} ${question.prompt}`,
    answer: question.answer,
    explanation: question.explanation,
    page: fromPage + Math.round(((toPage - fromPage) * index) / lastIndex),
    ...(question.options ? { options: question.options } : {}),
  }));
}
