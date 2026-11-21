export type Unit = {
  id: string;
  week: string;
  title: string;
  subtitle: string;
  progress: number;
  status: 'done' | 'active' | 'next';
};

export const UNITS: Unit[] = [
  { id: 'u1', week: '1주차', title: '첫 만남', subtitle: '인사와 자기소개', progress: 100, status: 'done' },
  { id: 'u2', week: '2주차', title: '캠퍼스에서', subtitle: '길 묻고 답하기', progress: 100, status: 'done' },
  { id: 'u3', week: '3주차', title: '카페에서 주문하기', subtitle: '음료·간식 주문', progress: 64, status: 'active' },
  { id: 'u4', week: '4주차', title: '시장에서', subtitle: '가격 묻고 흥정하기', progress: 0, status: 'next' },
  { id: 'u5', week: '5주차', title: '리스본 여행', subtitle: '교통·숙소', progress: 0, status: 'next' },
];

export type Correction = {
  original: string;
  corrected: string;
  explanation: string;
  tag: string;
};

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  pt: string;
  ko?: string;
  correction?: Correction;
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm0',
    role: 'ai',
    pt: 'Olá! Bem-vindo ao café. O que você gostaria de pedir?',
    ko: '안녕하세요! 카페에 오신 것을 환영해요. 무엇을 주문하시겠어요?',
  },
];

export const SUGGESTIONS = ['Eu quero café, por favor.', 'Um pastel de nata, por favor.', 'Quanto custa o café?'];

export type MockReply = {
  pt: string;
  ko: string;
  correction?: Correction;
};

export function mockReply(input: string, turn: number): MockReply {
  const lower = input.toLowerCase();

  if (!/[a-zà-ÿ]/i.test(input)) {
    return {
      pt: 'Tente em português! Você consegue. Por exemplo: “Eu quero um café, por favor.”',
      ko: '포르투갈어로 말해볼까요? 예를 들어 “Eu quero um café, por favor.”라고 해보세요.',
    };
  }

  const objectMatch = input.match(/quero\s+([^\s,.!?]+)/i);
  if (objectMatch && !/^(um|uma|o|a|os|as)$/i.test(objectMatch[1])) {
    const noun = objectMatch[1];
    const article = /a$/i.test(noun) ? 'uma' : 'um';
    const particle = article === 'um' ? '을' : '를';
    const corrected = input.replace(/quero\s+/i, `quero ${article} `);
    return {
      pt: 'Claro! Um café, por favor. Quer algo para comer também?',
      ko: '물론이죠! 커피 한 잔 주세요. 먹을 것도 드릴까요?',
      correction: {
        original: input,
        corrected,
        explanation: `셀 수 있는 명사 앞에는 부정관사가 필요해요. “${noun}”는 ${article === 'um' ? '남성' : '여성'} 명사라서 ${article}${particle} 씁니다.`,
        tag: '관사',
      },
    };
  }

  if (/quanto custa|quanto é/.test(lower)) {
    return {
      pt: 'O café custa três euros e o pastel custa dois euros. Vai querer os dois?',
      ko: '커피는 3유로, 파스텔은 2유로예요. 둘 다 드릴까요?',
    };
  }

  if (/pastel/.test(lower)) {
    return {
      pt: 'Ótima escolha! O pastel de nata sai quentinho. Mais alguma coisa?',
      ko: '좋은 선택이에요! 파스텔 드 나타는 따뜻하게 나와요. 더 필요한 건 없으세요?',
    };
  }

  if (/obrigad/.test(lower)) {
    return {
      pt: 'De nada! Foi um prazer. Volte sempre ao nosso café.',
      ko: '천만에요! 즐거웠어요. 또 오세요.',
    };
  }

  if (turn >= 4) {
    return {
      pt: 'Muito bem! Você praticou o vocabulário do café hoje. Até a próxima!',
      ko: '잘했어요! 오늘 카페 어휘를 연습했어요. 다음에 또 만나요!',
    };
  }

  return {
    pt: 'Muito bem! Entendi. Quer pedir mais alguma coisa ou perguntar o preço?',
    ko: '잘했어요! 이해했어요. 더 주문하거나 가격을 물어볼까요?',
  };
}

export type Weakness = {
  label: string;
  percent: number;
  note: string;
  example: string;
};

export const WEAKNESSES: Weakness[] = [
  { label: '관사 um / uma', percent: 42, note: '남성·여성 명사 구분', example: 'Eu quero café → Eu quero um café' },
  { label: '동사 변형', percent: 31, note: '1인칭 eu 형태', example: 'eu querer → eu quero' },
  { label: '전치사', percent: 18, note: 'em / de / com', example: 'café de leite → café com leite' },
  { label: '철자', percent: 9, note: 'ç / ã / õ', example: 'obrigado → obrigado' },
];

export const ERROR_TAGS = [
  { tag: '관사', count: 18 },
  { tag: '동사', count: 12 },
  { tag: '철자', count: 7 },
  { tag: '어순', count: 3 },
];

export type StudentRow = {
  name: string;
  studentId: string;
  practices: number;
  error: string;
  last: string;
  level: 'high' | 'mid' | 'low';
};

export const STUDENT_ROWS: StudentRow[] = [
  { name: '김○○', studentId: '202503356', practices: 12, error: '관사', last: '오늘 09:41', level: 'high' },
  { name: '이○○', studentId: '202501882', practices: 9, error: '동사 변형', last: '오늘 08:12', level: 'mid' },
  { name: '박○○', studentId: '202402117', practices: 7, error: '관사', last: '어제 21:30', level: 'high' },
  { name: '최○○', studentId: '202400931', practices: 5, error: '전치사', last: '어제 16:04', level: 'mid' },
  { name: '정○○', studentId: '202507744', practices: 3, error: '철자', last: '11월 19일', level: 'low' },
];

export const CLASS_STATS = {
  students: 28,
  practices: 342,
  correctionRate: 87,
  active: 24,
};
