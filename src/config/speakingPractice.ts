export type SpeakingPracticeQuestion = {
  id: string;
  label: string;
  instruction: string;
  promptType: 'audio' | 'boo' | 'sentence';
  prompt: string;
  responseType: 'text' | 'recording' | 'choice';
  placeholder?: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export const SPEAKING_PRACTICE_QUESTIONS: SpeakingPracticeQuestion[] = [
  {
    id: 'listen-balcony',
    label: '듣고 이해하기',
    instruction: '에코가 무엇을 물었는지 한국어로 짧게 적으세요.',
    promptType: 'audio',
    prompt: 'A sua casa tem uma varanda?',
    responseType: 'text',
    placeholder: '한국어로 짧게 적어 보세요',
    answer: '집에 발코니가 있는지 물었어요.',
    explanation: 'A sua casa tem uma varanda?',
  },
  {
    id: 'write-living-room',
    label: '응답 한 줄 쓰기',
    instruction: '에코의 질문에 포르투갈어 한 문장으로 답하세요.',
    promptType: 'boo',
    prompt: 'O que você faz na sala de estar?',
    responseType: 'text',
    placeholder: '여기에 답을 적어 보세요',
    answer: 'Eu assisto à televisão na sala de estar.',
    explanation: '거실에서 하는 활동을 한 문장에 담아요.',
  },
  {
    id: 'speak-garden',
    label: '직접 말하기',
    instruction: '에코의 음성 질문을 듣고 포르투갈어 한 문장으로 답하세요.',
    promptType: 'audio',
    prompt: 'Como é o seu jardim?',
    responseType: 'recording',
    answer: 'O meu jardim é grande.',
    explanation: 'Como é o seu jardim?',
  },
  {
    id: 'read-balcony',
    label: '소리 내어 읽기',
    instruction: '화면의 포르투갈어 문장을 자연스럽게 읽고 녹음하세요.',
    promptType: 'sentence',
    prompt: 'A minha varanda é estreita.',
    responseType: 'recording',
    answer: 'A minha varanda é estreita.',
    explanation: '제시된 단어를 빠뜨리지 않고 문장을 읽어요.',
  },
  {
    id: 'choose-bedroom',
    label: '객관식',
    instruction: '에코의 질문에 알맞은 응답을 고르세요.',
    promptType: 'boo',
    prompt: 'Onde você joga no computador?',
    responseType: 'choice',
    options: ['É grande.', 'Está limpo.', 'No quarto.'],
    answer: 'No quarto.',
    explanation: 'Onde는 장소를 묻는 표현이에요.',
  },
];
