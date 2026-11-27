import { mockRequest } from './client';
import type { ApiQuery, Insights, WeeklyReport } from './types';

const summaries: Record<number, Insights> = {
  1: { headline: '관사와 명사의 성·수 일치 오류가 가장 많이 반복됐어요.', body: '학생들은 부정관사 um/uma의 형태는 알고 있지만, 뒤에 오는 명사의 성·수와 맞추는 과정에서 실수해요. 전치사 축약 오류는 지난주보다 늘어 짧은 문장 연습이 효과적일 것으로 보여요.', generatedAt: '2026-11-23T06:00:00' },
  2: { headline: '과거형 시제 일관성 오류가 가장 많이 반복됐어요.', body: '학생들은 과거 경험을 쓰면서 문장마다 시제를 일관되게 유지하는 과정에서 실수해요. 시간 순서에 따라 문장을 연결하고 형용사 성·수를 확인하는 글쓰기 연습이 도움이 될 것 같아요.', generatedAt: '2026-11-23T06:00:00' },
  3: { headline: '정중한 주문 표현과 가격 질문을 더 연습해야 해요.', body: '학생들은 원하는 메뉴를 말하는 데는 익숙하지만, 정중한 요청이나 가격 질문을 자연스럽게 이어 가는 데 어려움이 있어요. 짧은 역할극으로 주문부터 감사 인사까지 연습하면 효과적일 것으로 보여요.', generatedAt: '2026-11-23T06:00:00' },
};
const sampleRows: Record<number, Array<{ tag: string; studentCount: number; rate: number; original: string; corrected: string; moreExamples: string[] }>> = {
  1: [
    { tag: '관사와 명사의 성·수 일치', studentCount: 19, rate: 42, original: 'uma café', corrected: 'um café', moreExamples: ['Eu quero uma café.', 'A conta são oito euros.'] },
    { tag: '전치사 축약 em + a / a + a', studentCount: 14, rate: 31, original: 'no mesa', corrected: 'na mesa', moreExamples: ['O menu está no mesa.', 'Eu vou a a loja.'] },
    { tag: 'ser / estar 구분', studentCount: 9, rate: 24, original: 'Eu sou cansada.', corrected: 'Eu estou cansada.', moreExamples: ['Hoje sou cansado.', 'A loja é fechada agora.'] },
    { tag: '형용사 성 일치', studentCount: 7, rate: 18, original: 'festa divertido', corrected: 'festa divertida', moreExamples: ['A comida é gostoso.', 'Uma cidade bonito.'] },
  ],
  2: [
    { tag: '과거형 시제 일관성', studentCount: 16, rate: 38, original: 'Eu vou à festa ontem.', corrected: 'Eu fui à festa ontem.', moreExamples: ['Eu estudei e depois vou dormir.', 'Nós foi ao mercado.'] },
    { tag: '문장 연결', studentCount: 12, rate: 30, original: 'Eu gostei. A festa foi boa.', corrected: 'Eu gostei porque a festa foi boa.', moreExamples: ['A comida estava boa. Eu comi muito.', 'Eu fui à festa. Eu encontrei meus amigos.'] },
    { tag: '형용사 성·수 일치', studentCount: 9, rate: 24, original: 'A festa foi divertido.', corrected: 'A festa foi divertida.', moreExamples: ['As comidas estavam bom.', 'Meus amigas estavam felizes.'] },
    { tag: '장소·시간 표현', studentCount: 7, rate: 18, original: 'Eu fui em sábado.', corrected: 'Eu fui no sábado.', moreExamples: ['A festa foi na escola em sábado.', 'Eu cheguei para oito horas.'] },
  ],
  3: [
    { tag: '정중한 주문 표현', studentCount: 15, rate: 36, original: 'Quero café.', corrected: 'Queria um café, por favor.', moreExamples: ['Me dá água.', 'Quero conta.'] },
    { tag: '가격 질문·응답', studentCount: 12, rate: 30, original: 'Quanto?', corrected: 'Quanto custa?', moreExamples: ['É muito?', 'Custa quanto isso?'] },
    { tag: '주문 내용 구체화', studentCount: 9, rate: 24, original: 'Quero açaí.', corrected: 'Quero um açaí pequeno com morango.', moreExamples: ['Eu quero café grande.', 'Com banana.'] },
    { tag: '대화 마무리 표현', studentCount: 7, rate: 18, original: 'Tchau.', corrected: 'Obrigado. Até logo!', moreExamples: ['Obrigado, tchau.', 'Valeu.'] },
  ],
};
const dates: Record<number, [string, string]> = { 1: ['2026-11-03', '2026-11-09'], 2: ['2026-11-10', '2026-11-16'], 3: ['2026-11-17', '2026-11-23'], 4: ['2026-11-24', '2026-11-30'], 5: ['2026-12-01', '2026-12-07'] };

/** B16 GET /prof/insights?courseId=&sectionId=&week= — Bearer(교수만) */
export function getInsights(filters: ApiQuery = {}) { return mockRequest<Insights>('B16', () => summaries[filters.courseId ?? 1] ?? summaries[1]); }
/** B17 GET /prof/reports/weekly?courseId=&sectionId=&week= — Bearer(교수만) */
export function getWeeklyReport(filters: ApiQuery = {}) { return mockRequest<WeeklyReport>('B17', () => {
  if (filters.sectionId === 2) return null;
  const week = filters.week ?? 3;
  const [startDate, endDate] = dates[week] ?? dates[3];
  return { week, startDate, endDate, errors: (sampleRows[filters.courseId ?? 1] ?? sampleRows[1]).map((item, index) => ({ rank: index + 1, tag: item.tag, studentCount: item.studentCount, rate: item.rate, example: { original: item.original, corrected: item.corrected }, moreExamples: item.moreExamples })) };
}); }
