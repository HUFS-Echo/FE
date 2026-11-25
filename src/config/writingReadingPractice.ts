export type WritingReadingQuestion = {
  id: string;
  label: string;
  instruction: string;
  promptType: 'boo' | 'reading';
  promptLabel: string;
  prompt: string;
  responseType: 'text' | 'choice';
  placeholder?: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export const WRITING_READING_QUESTIONS: WritingReadingQuestion[] = [
  {
    id: 'azulejos-locations',
    label: '핵심 정보 찾기',
    instruction: '글을 읽고, 집 안에서 타일이 있는 두 곳을 한국어로 적으세요.',
    promptType: 'boo',
    promptLabel: 'Boo',
    prompt: 'Na minha casa, temos azulejos na varanda e na sala de estar. Os azulejos são de Lisboa.',
    responseType: 'text',
    placeholder: '여기에 답을 적어 보세요',
    answer: '베란다와 거실',
    explanation: 'varanda는 베란다, sala de estar는 거실이에요.',
  },
  {
    id: 'museum-purpose',
    label: '글의 목적 파악',
    instruction: '이 글을 쓴 가장 중요한 이유를 한국어로 짧게 적으세요.',
    promptType: 'reading',
    promptLabel: '읽을 글',
    prompt: 'Venha conhecer o Museu Nacional do Azulejo, em Lisboa. Lá, você pode ver azulejos de diferentes épocas e conhecer a história de Portugal.',
    responseType: 'text',
    placeholder: '여기에 답을 적어 보세요',
    answer: '리스본의 국립 타일 박물관을 방문하도록 권하기',
    explanation: 'Venha conhecer는 방문을 권하는 표현이에요.',
  },
  {
    id: 'describe-a-room',
    label: '필수 정보를 담아 쓰기',
    instruction: '집 안의 공간 한 곳과 그 공간의 특징 한 가지를 포르투갈어 한 문장에 담으세요.',
    promptType: 'boo',
    promptLabel: 'Boo',
    prompt: 'Como é um cômodo da sua casa?',
    responseType: 'text',
    placeholder: '여기에 답을 적어 보세요',
    answer: 'O meu quarto é pequeno.',
    explanation: '공간과 크기·모양 등의 특징을 함께 썼는지 살펴보세요.',
  },
  {
    id: 'reply-about-snack',
    label: '읽고 답장 쓰기',
    instruction: '메시지를 읽고, 집 안에서 간식을 어디에서 준비하는지 포르투갈어 한 문장으로 답하세요.',
    promptType: 'boo',
    promptLabel: 'Boo',
    prompt: 'Oi! Em que cômodo da casa você prepara o lanche?',
    responseType: 'text',
    placeholder: '여기에 답을 적어 보세요',
    answer: 'Eu preparo o lanche na cozinha.',
    explanation: '질문에서 묻는 장소를 답장에 넣어요.',
  },
  {
    id: 'azulejo-blue',
    label: '객관식',
    instruction: '글에서 파란색이 무엇을 나타내는지 고르세요.',
    promptType: 'reading',
    promptLabel: '읽을 글',
    prompt: 'Nos azulejos portugueses, o azul representa o céu e o mar. O azul e o branco aparecem juntos em muitos azulejos.',
    responseType: 'choice',
    options: ['하늘과 바다', '바다와 숲', '하늘과 강'],
    answer: '하늘과 바다',
    explanation: 'céu는 하늘, mar는 바다예요.',
  },
];
