import { mockRequest, fail } from './client';
import type { SpeakingSession } from './types';
const sample: SpeakingSession = { sessionId: 77, title: '카페에서 주문하기', estimatedMinutes: 10, role: { me: '카페 손님', tutor: '종업원' }, scope: { title: '카페에서 주문하고 가격 묻기', pdfPages: '48–49', week: 3 }, goals: [{ goalId: 'ORDER', label: '음료 주문하기', done: false }, { goalId: 'PRICE', label: '가격 묻기', done: false }], keyExpressions: ['Eu quero um café, por favor.', 'Quanto custa o café?'], messages: [{ messageId: 1, sender: 'TUTOR', content: 'Olá! O que você gostaria de pedir?', translation: '안녕하세요! 무엇을 주문하시겠어요?', correction: null }], suggestions: ['Eu quero café, por favor.', 'Quanto custa o café?'] };
/** C1 POST /speaking-sessions — Bearer(학생만), 화면 미연결 */
export function startSpeakingSession(setId: number) { return mockRequest('C1', () => ({ ...sample, sessionId: setId || sample.sessionId })); }
/** C2 POST /speaking-sessions/{sessionId}/messages — Bearer(학생만), 화면 미연결 */
export function sendSpeakingMessage(sessionId: number, input: { content: string; inputType: 'TEXT' | 'VOICE' }) { return mockRequest('C2', () => { if (!input.content.trim()) fail(400, 'INVALID_INPUT', '메시지를 입력해 주세요.'); return { sessionId, myMessage: { messageId: 2, sender: 'STUDENT', content: input.content, correction: null }, reply: { messageId: 3, sender: 'TUTOR', content: 'Claro! Mais alguma coisa?', translation: '물론이죠! 더 필요한 건 없으세요?' }, goals: sample.goals, suggestions: sample.suggestions }; }); }
/** C3 POST /speaking-sessions/{sessionId}/transcriptions — Bearer(학생만), multipart mock, 화면 미연결 */
export function transcribeSpeakingSession(_sessionId: number, _audio?: Blob) { return mockRequest('C3', () => ({ text: 'Quanto custa o café?', durationSec: 3.2 })); }
/** C4 POST /speaking-sessions/{sessionId}/finish — Bearer(학생만), 화면 미연결 */
export function finishSpeakingSession(_sessionId: number) { return mockRequest('C4', () => ({ summary: { subject: 'SPEAKING', courseTitle: '포르투갈어 회화', typeLabel: '역할극', title: '카페 미션 완료!', message: '카페 미션을 마쳤어요. 연습 결과를 확인해 보세요.', stats: [{ label: '말한 문장', value: 6, suffix: '문장' }, { label: '미션', value: '2/2' }], corrections: [] } })); }
