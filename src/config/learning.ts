/**
 * HUFS Echo — student learning mock data
 *
 * The post-login student experience is a light "study desk" with navy accents.
 * All content here is mock data; swap the exported constants for API responses later.
 */

export type SubjectId = 'reading' | 'writing' | 'speaking';

export type Subject = {
  id: SubjectId;
  name: string;
  type: string;
  course: string;
  rangeTitle: string;
  pdf: string;
  deadline: string;
  cta: string;
  tone: 'blue' | 'amber' | 'mint';
};

export const SUBJECTS: Subject[] = [
  {
    id: 'reading',
    name: '포르투갈어 문법',
    type: '문법',
    course: 'PT-GRAM1',
    rangeTitle: '부정관사와 명사의 성·수 일치',
    pdf: 'PDF 29–30쪽',
    deadline: '11.23(일)까지',
    cta: '학습하기',
    tone: 'blue',
  },
  {
    id: 'writing',
    name: '포르투갈어 읽기와 쓰기',
    type: '작문·교정',
    course: 'PT-READ1',
    rangeTitle: '학교 파티 일기 쓰기',
    pdf: 'PDF 93쪽',
    deadline: '11.23(일)까지',
    cta: '학습하기',
    tone: 'amber',
  },
  {
    id: 'speaking',
    name: '포르투갈어 회화',
    type: '말하기',
    course: 'PT-TALK1',
    rangeTitle: '카페에서 주문하고 가격 묻기',
    pdf: 'PDF 48–49쪽',
    deadline: '11.23(일)까지',
    cta: '학습하기',
    tone: 'mint',
  },
];

export const LOCKED_SUBJECT = {
  id: 'indonesian',
  name: '인도네시아어',
  type: '기초',
  note: '준비 중',
};

export const WEEK = {
  no: 3,
  label: '3주차',
  dates: '11.17 – 11.23',
  deadline: '11.23(일)까지',
  goalDone: 3,
  goalTotal: 4,
};

export function getSubject(id: SubjectId): Subject {
  return SUBJECTS.find((subject) => subject.id === id) ?? SUBJECTS[0];
}

export const COURSE_LABELS: Record<SubjectId, string> = {
  reading: '포르투갈어 문법',
  writing: '포르투갈어 읽기와 쓰기',
  speaking: '포르투갈어 회화',
};

export function isCourseDisabled(id: SubjectId, disabledCourses: readonly string[]): boolean {
  return disabledCourses.includes(COURSE_LABELS[id]) || disabledCourses.includes(id);
}

export type PracticeSet = {
  id: string;
  subject: SubjectId;
  kind: string;
  title: string;
  desc: string;
  count: number;
  done: number;
  minutes: number;
  status: 'done' | 'active' | 'new';
};

export const PRACTICE_SETS: Record<SubjectId, PracticeSet[]> = {
  reading: [
    {
      id: 'r1',
      subject: 'reading',
      kind: '문법',
      title: '빈칸 채우기',
      desc: '부정관사 um / uma를 골라 문장을 완성해요.',
      count: 10,
      done: 6,
      minutes: 8,
      status: 'active',
    },
    {
      id: 'r2',
      subject: 'reading',
      kind: '문법',
      title: '선택형',
      desc: '관사와 명사의 성·수에 맞는 표현을 골라요.',
      count: 8,
      done: 2,
      minutes: 6,
      status: 'active',
    },
    {
      id: 'r3',
      subject: 'reading',
      kind: '쓰기',
      title: '문장 바꿔 쓰기',
      desc: '관사를 넣어 자연스러운 문장으로 다시 써요.',
      count: 6,
      done: 0,
      minutes: 7,
      status: 'new',
    },
  ],
  writing: [
    {
      id: 'w1',
      subject: 'writing',
      kind: '작문',
      title: '초안 쓰기',
      desc: '학교 파티 일기를 80–120단어로 써요.',
      count: 1,
      done: 0,
      minutes: 15,
      status: 'active',
    },
    {
      id: 'w2',
      subject: 'writing',
      kind: '교정',
      title: '교정 반영',
      desc: 'AI 교정 카드를 읽고 문장을 다듬어요.',
      count: 3,
      done: 1,
      minutes: 6,
      status: 'active',
    },
    {
      id: 'w3',
      subject: 'writing',
      kind: '다시 쓰기',
      title: '다시 쓰기',
      desc: '교정을 반영해 한 번 더 완성해요.',
      count: 1,
      done: 0,
      minutes: 8,
      status: 'new',
    },
  ],
  speaking: [
    {
      id: 's1',
      subject: 'speaking',
      kind: '역할극',
      title: '카페 미션',
      desc: '종업원과 주문하고 가격을 물어봐요.',
      count: 2,
      done: 1,
      minutes: 10,
      status: 'active',
    },
    {
      id: 's2',
      subject: 'speaking',
      kind: '표현',
      title: '핵심 표현 연습',
      desc: '주문·가격 표현을 소리 내어 말해요.',
      count: 6,
      done: 3,
      minutes: 5,
      status: 'active',
    },
    {
      id: 's3',
      subject: 'speaking',
      kind: '자유 대화',
      title: '자유 대화',
      desc: '오늘 배운 표현으로 자유롭게 대화해요.',
      count: 1,
      done: 0,
      minutes: 8,
      status: 'new',
    },
  ],
};

export type OtherMission = {
  subject: SubjectId;
  title: string;
  meta: string;
};

export const OTHER_MISSIONS: Record<SubjectId, OtherMission[]> = {
  reading: [
    { subject: 'writing', title: '학교 파티 일기', meta: '읽기와 쓰기 · 80–120단어' },
    { subject: 'speaking', title: '카페에서 주문하기', meta: '회화 · 역할극 10분' },
  ],
  writing: [
    { subject: 'reading', title: '부정관사 빈칸 채우기', meta: '문법 · 10문제' },
    { subject: 'speaking', title: '카페에서 주문하기', meta: '회화 · 역할극 10분' },
  ],
  speaking: [
    { subject: 'reading', title: '부정관사 빈칸 채우기', meta: '문법 · 10문제' },
    { subject: 'writing', title: '학교 파티 일기', meta: '읽기와 쓰기 · 80–120단어' },
  ],
};

/* ------------------------------------------------------------------ */
/* Reading                                                             */
/* ------------------------------------------------------------------ */

export type ReadingQuestionType = 'form' | 'fill' | 'correct' | 'choice' | 'rewrite';

export type ReadingQuestion = {
  id: string;
  type: ReadingQuestionType;
  label: string;
  instruction: string;
  prompt: string;
  answer: string;
  options?: string[];
  explanation: string;
  source: string;
};

export const READING_QUESTIONS: ReadingQuestion[] = [
  {
    id: 'grammar-form-ser-eu', type: 'form', label: '형태 쓰기',
    instruction: '동사 ser를 주어 eu에 맞는 직설법 현재형으로 쓰세요.',
    prompt: 'eu + ser', answer: 'sou',
    explanation: '동사 ser는 eu와 함께 사용할 때 sou로 변화해요.', source: 'eu + ser',
  },
  {
    id: 'grammar-fill-varanda', type: 'fill', label: '빈칸 채우기',
    instruction: '명사의 성과 수에 맞는 부정관사를 써 보세요.',
    prompt: 'Na minha casa, tem ___ varanda.', answer: 'uma',
    explanation: 'varanda는 여성 단수 명사이므로 부정관사 uma를 써요.', source: 'Na minha casa, tem uma varanda.',
  },
  {
    id: 'grammar-correct-estar', type: 'correct', label: '한 부분 고치기',
    instruction: '지금의 상태를 나타내도록, 대괄호 안의 동사만 고쳐 쓰세요.',
    prompt: 'O quarto [é] arrumado agora.', answer: 'está',
    explanation: '정돈된 현재 상태를 나타내므로 ser가 아니라 estar를 써요.', source: 'O quarto está arrumado agora.',
  },
  {
    id: 'grammar-rewrite-cozinha', type: 'rewrite', label: '문장 바꾸기',
    instruction: '주어를 A cozinha로 바꾸고, 뜻이 유지되도록 문장 전체를 다시 쓰세요.',
    prompt: 'O banheiro está sujo.', answer: 'A cozinha está suja.',
    explanation: '주어가 여성형인 A cozinha로 바뀌므로 형용사도 suja로 일치시켜요.', source: 'A cozinha está suja.',
  },
  {
    id: 'grammar-choice-escritorio', type: 'choice', label: '객관식',
    instruction: '빈칸에 들어갈 부정관사를 골라 보세요.',
    prompt: 'No meu apartamento, tem ___ escritório.', answer: 'um', options: ['uma', 'um', 'uns'],
    explanation: 'escritório는 남성 단수 명사이므로 부정관사 um을 써요.', source: 'No meu apartamento, tem um escritório.',
  },
];

export const PDF_EXCERPT = {
  page: '29',
  chapter: 'Gramática · Artigos indefinidos',
  title: 'um, uma, uns, umas',
  lines: [
    'Os artigos indefinidos acompanham o substantivo.',
    'um café · uma água · uns pastéis · umas maçãs',
    'Eu quero um café, por favor.',
    'Ela pede uma água sem gás.',
    'O café está na mesa.',
    'Nós queremos um sanduíche.',
  ],
  note: '남성 명사에는 um, 여성 명사에는 uma를 사용합니다.',
};

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

export type WritingCorrection = {
  id: string;
  original: string;
  corrected: string;
  tag: string;
  explanation: string;
};

export const WRITING_TASK = {
  title: '학교 파티 일기',
  prompt: '지난주 학교 파티에서 있었던 일을 포르투갈어 일기로 써 보세요.',
  range: 'PDF 93쪽',
  length: '80–120단어',
  deadline: '11.23(일)까지',
  checklist: [
    { id: 'place', label: '장소를 말했나요?', keywords: ['escola', 'festa', 'salão'] },
    { id: 'food', label: '먹은 음식을 말했나요?', keywords: ['bolo', 'suco', 'comida', 'pastel'] },
    { id: 'feeling', label: '느낌을 말했나요?', keywords: ['feliz', 'divertid', 'legal', 'bom'] },
  ],
  expressions: ['foi muito divertido', 'eu comi bolo', 'eu encontrei meus amigos', 'foi um dia feliz'],
  initialDraft:
    'No sábado passado, eu fui na festa da escola. A festa foi muito legal. Eu comi bolo e bebi suco. Eu encontrei meus amigos e nós dançamos. Foi um dia feliz.',
  strengths: [
    '과거형 동사를 자연스럽게 사용했어요.',
    '문장을 짧고 명확하게 이어 갔어요.',
    '일기의 흐름이 시간 순서대로 잘 정리되어 있어요.',
  ],
  corrections: [
    {
      id: 'wc1',
      original: 'na festa',
      corrected: 'à festa',
      tag: '전치사',
      explanation: 'festa 앞에는 전치사 a가 필요하고, a + a는 à로 축약됩니다.',
    },
    {
      id: 'wc2',
      original: 'muito legal',
      corrected: 'muito divertida',
      tag: '형용사 성 일치',
      explanation: 'festa는 여성 명사라서 형용사 divertida를 씁니다.',
    },
    {
      id: 'wc3',
      original: 'encontrei meus amigos',
      corrected: 'encontrei os meus amigos',
      tag: '관사',
      explanation: '소유 대명사 앞에는 정관사 os를 함께 쓰는 것이 자연스럽습니다.',
    },
  ] satisfies WritingCorrection[],
};

/* ------------------------------------------------------------------ */
/* Speaking                                                            */
/* ------------------------------------------------------------------ */

export const SPEAKING_MISSION = {
  role: '나는 카페 손님 · 상대는 종업원',
  title: '카페에서 주문하고 가격 묻기',
  range: 'PDF 48–49쪽',
  goals: [
    { id: 'order', label: '음료 주문하기', keywords: ['quero', 'café', 'pastel', 'pedir'] },
    { id: 'price', label: '가격 묻기', keywords: ['quanto', 'custa', 'preço'] },
  ],
  expressions: [
    'Eu quero um café, por favor.',
    'Quanto custa o café?',
    'Um pastel de nata, por favor.',
    'Obrigado!',
  ],
};

/* ------------------------------------------------------------------ */
/* Correction history                                                  */
/* ------------------------------------------------------------------ */

export type HistoryItem = {
  id: string;
  date: string;
  week: string;
  original: string;
  corrected: string;
  tag: string;
  explanation: string;
  repeat: number;
  subject: SubjectId;
};

export const HISTORY_WEEK_FILTERS = ['전체', '1주차', '2주차', '3주차'] as const;

export const CORRECTION_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    date: '오늘',
    week: '3주차',
    original: 'Eu quero café.',
    corrected: 'Eu quero um café.',
    tag: '관사',
    explanation: '셀 수 있는 남성 명사 앞에는 um이 필요해요.',
    repeat: 3,
    subject: 'reading',
  },
  {
    id: 'h2',
    date: '오늘',
    week: '3주차',
    original: 'A festa foi muito legal.',
    corrected: 'A festa foi muito divertida.',
    tag: '형용사 성 일치',
    explanation: 'festa는 여성 명사라서 divertida를 씁니다.',
    repeat: 1,
    subject: 'writing',
  },
  {
    id: 'h3',
    date: '어제',
    week: '3주차',
    original: 'Eu fui na festa.',
    corrected: 'Eu fui à festa.',
    tag: '전치사',
    explanation: 'a + a는 à로 축약됩니다.',
    repeat: 2,
    subject: 'writing',
  },
  {
    id: 'h4',
    date: '어제',
    week: '3주차',
    original: 'Eu quero água.',
    corrected: 'Eu quero uma água.',
    tag: '관사',
    explanation: 'água는 여성 명사라서 uma를 씁니다.',
    repeat: 0,
    subject: 'speaking',
  },
  {
    id: 'h5',
    date: '11.19',
    week: '3주차',
    original: 'O café está no mesa.',
    corrected: 'O café está na mesa.',
    tag: '전치사',
    explanation: 'mesa는 여성 명사라서 em + a = na입니다.',
    repeat: 1,
    subject: 'reading',
  },
  {
    id: 'h6',
    date: '11.18',
    week: '3주차',
    original: 'Ela quer um água.',
    corrected: 'Ela quer uma água.',
    tag: '관사',
    explanation: 'água는 여성 명사라서 uma를 씁니다.',
    repeat: 2,
    subject: 'writing',
  },
  {
    id: 'h7',
    date: '11.17',
    week: '3주차',
    original: 'Nós comemos uns pastel.',
    corrected: 'Nós comemos uns pastéis.',
    tag: '수 일치',
    explanation: 'uns 뒤에는 복수 명사 pastéis가 와야 합니다.',
    repeat: 0,
    subject: 'reading',
  },
];

/* ------------------------------------------------------------------ */
/* Weeks                                                               */
/* ------------------------------------------------------------------ */

export type WeekStatus = 'done' | 'active' | 'locked';

export type WeekItem = {
  no: number;
  dates: string;
  range: string;
  pdf: string;
  status: WeekStatus;
  participation?: number;
  accuracy?: number;
  openAt?: string;
};

export const WEEKS: WeekItem[] = [
  {
    no: 1,
    dates: '11.03 – 11.09',
    range: '인사와 자기소개',
    pdf: 'PDF 8–12쪽',
    status: 'done',
    participation: 92,
    accuracy: 88,
  },
  {
    no: 2,
    dates: '11.10 – 11.16',
    range: '길 묻고 답하기',
    pdf: 'PDF 18–22쪽',
    status: 'done',
    participation: 88,
    accuracy: 82,
  },
  {
    no: 3,
    dates: '11.17 – 11.23',
    range: '부정관사와 명사의 성·수 일치',
    pdf: 'PDF 29–30쪽',
    status: 'active',
    participation: 76,
    accuracy: 84,
  },
  {
    no: 4,
    dates: '11.24 – 11.30',
    range: '시장에서 가격 묻기',
    pdf: 'PDF 38–42쪽',
    status: 'locked',
    openAt: '11.24에 열려요',
  },
  {
    no: 5,
    dates: '12.01 – 12.07',
    range: '리스본 여행',
    pdf: 'PDF 52–58쪽',
    status: 'locked',
    openAt: '12.01에 열려요',
  },
  {
    no: 6,
    dates: '12.08 – 12.14',
    range: '학교 생활과 친구',
    pdf: 'PDF 64–70쪽',
    status: 'locked',
    openAt: '12.08에 열려요',
  },
];
