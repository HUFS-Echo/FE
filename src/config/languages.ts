/**
 * HUFS Echo — languages
 *
 * 교육부 지정 특수외국어 21개(HUFS 국제처 공식 목록)를 기준으로 합니다.
 * - 포르투갈어는 포르투갈·브라질 두 개의 핀을 가집니다(같은 언어, 두 지역).
 * - 베트남어는 21개에는 포함되지 않지만, 인트로 인사말 순환과 3단계 확장 계획을 위해
 *   `official: false`로 함께 수록했습니다. (PDF의 3단계: 일반 전공어 확장)
 *
 * `greeting`은 제목에 사용하는 로마자 표기입니다. 라틴 확장 문자(á, à, ầ, ś, ő 등)를
 * 지원하는 Instrument Serif로 렌더링하며, 원문 표기는 `greetingNative`에 두고
 * 툴팁에서만 Noto Sans 서브셋으로 보여줍니다.
 */

export type PinStatus = 'active' | 'coming_soon';
export type Region = 'pilot' | 'europe' | 'asia' | 'mea';
export type Script =
  | 'latin'
  | 'cyrillic'
  | 'greek'
  | 'devanagari'
  | 'thai'
  | 'lao'
  | 'arabic';

export type LanguagePin = {
  /** 핀 고유 id (국가 코드) */
  id: string;
  languageId: string;
  countryKo: string;
  countryNative: string;
  /** public/flags/<flag>.png */
  flag: string;
  lat: number;
  lon: number;
  status: PinStatus;
  statusLabel: string;
  note: string;
};

export type Language = {
  id: string;
  nameKo: string;
  nameNative: string;
  /** 라벨에 쓰는 2자리 코드 */
  code: string;
  /** 제목에 타자로 쳐지는 인사말 (로마자 표기) */
  greeting: string;
  /** 툴팁에만 표시하는 원문 인사말 */
  greetingNative?: string;
  script: Script;
  /** 교육부 지정 21개 특수외국어 여부 */
  official: boolean;
  region: Region;
  /** 인트로 인사말 순환 참여 여부 */
  inCycle: boolean;
  pins: LanguagePin[];
};

export const SEOUL = {
  id: 'seoul',
  nameKo: '서울',
  lat: 37.59,
  lon: 127.06,
} as const;

export const REGION_LABELS: Record<Region, string> = {
  pilot: '파일럿',
  europe: '유럽',
  asia: '아시아',
  mea: '중동·아프리카',
};

export const LANGUAGES: Language[] = [
  {
    id: 'pt',
    nameKo: '포르투갈어',
    nameNative: 'Português',
    code: 'PT',
    greeting: 'Olá',
    greetingNative: 'Olá',
    script: 'latin',
    official: true,
    region: 'pilot',
    inCycle: true,
    pins: [
      {
        id: 'pt',
        languageId: 'pt',
        countryKo: '포르투갈',
        countryNative: 'Portugal',
        flag: 'pt',
        lat: 38.72,
        lon: -9.14,
        status: 'active',
        statusLabel: '파일럿 진행 중',
        note: '리스본의 카페 · 3주차 단원',
      },
      {
        id: 'br',
        languageId: 'pt',
        countryKo: '브라질',
        countryNative: 'Brasil',
        flag: 'br',
        lat: -15.79,
        lon: -47.88,
        status: 'active',
        statusLabel: '파일럿 확장 예정',
        note: '브라질 포르투갈어 · 2단계',
      },
    ],
  },
  {
    id: 'id',
    nameKo: '인도네시아어',
    nameNative: 'Bahasa Indonesia',
    code: 'ID',
    greeting: 'Halo',
    greetingNative: 'Halo',
    script: 'latin',
    official: true,
    region: 'asia',
    inCycle: true,
    pins: [
      {
        id: 'id',
        languageId: 'id',
        countryKo: '인도네시아',
        countryNative: 'Indonesia',
        flag: 'id',
        lat: -6.21,
        lon: 106.85,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '말레이·인도네시아어',
      },
    ],
  },
  {
    id: 'vi',
    nameKo: '베트남어',
    nameNative: 'Tiếng Việt',
    code: 'VI',
    greeting: 'Xin chào',
    greetingNative: 'Xin chào',
    script: 'latin',
    official: false,
    region: 'asia',
    inCycle: true,
    pins: [
      {
        id: 'vi',
        languageId: 'vi',
        countryKo: '베트남',
        countryNative: 'Việt Nam',
        flag: 'vn',
        lat: 21.03,
        lon: 105.85,
        status: 'coming_soon',
        statusLabel: '확장 검토',
        note: '일반 전공어 확장 · 3단계',
      },
    ],
  },
  {
    id: 'tr',
    nameKo: '튀르키예어',
    nameNative: 'Türkçe',
    code: 'TR',
    greeting: 'Merhaba',
    greetingNative: 'Merhaba',
    script: 'latin',
    official: true,
    region: 'mea',
    inCycle: true,
    pins: [
      {
        id: 'tr',
        languageId: 'tr',
        countryKo: '튀르키예',
        countryNative: 'Türkiye',
        flag: 'tr',
        lat: 39.93,
        lon: 32.86,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '터키아제르바이잔어과',
      },
    ],
  },
  {
    id: 'hi',
    nameKo: '힌디어',
    nameNative: 'हिन्दी',
    code: 'HI',
    greeting: 'Namaste',
    greetingNative: 'नमस्ते',
    script: 'devanagari',
    official: true,
    region: 'asia',
    inCycle: true,
    pins: [
      {
        id: 'hi',
        languageId: 'hi',
        countryKo: '인도',
        countryNative: 'भारत',
        flag: 'in',
        lat: 28.61,
        lon: 77.21,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '인도어과 · 인도학과',
      },
    ],
  },
  {
    id: 'mn',
    nameKo: '몽골어',
    nameNative: 'Монгол хэл',
    code: 'MN',
    greeting: 'Sain baina uu',
    greetingNative: 'Сайн байна уу',
    script: 'cyrillic',
    official: true,
    region: 'asia',
    inCycle: true,
    pins: [
      {
        id: 'mn',
        languageId: 'mn',
        countryKo: '몽골',
        countryNative: 'Монгол',
        flag: 'mn',
        lat: 47.89,
        lon: 106.91,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '몽골어과',
      },
    ],
  },
  {
    id: 'sw',
    nameKo: '스와힐리어',
    nameNative: 'Kiswahili',
    code: 'SW',
    greeting: 'Jambo',
    greetingNative: 'Jambo',
    script: 'latin',
    official: true,
    region: 'mea',
    inCycle: true,
    pins: [
      {
        id: 'sw',
        languageId: 'sw',
        countryKo: '탄자니아',
        countryNative: 'Tanzania',
        flag: 'tz',
        lat: -6.79,
        lon: 39.21,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '아프리카학부',
      },
    ],
  },
  {
    id: 'pl',
    nameKo: '폴란드어',
    nameNative: 'Polski',
    code: 'PL',
    greeting: 'Cześć',
    greetingNative: 'Cześć',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: true,
    pins: [
      {
        id: 'pl',
        languageId: 'pl',
        countryKo: '폴란드',
        countryNative: 'Polska',
        flag: 'pl',
        lat: 52.23,
        lon: 21.01,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '폴란드어과',
      },
    ],
  },
  {
    id: 'hu',
    nameKo: '헝가리어',
    nameNative: 'Magyar',
    code: 'HU',
    greeting: 'Szia',
    greetingNative: 'Szia',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: true,
    pins: [
      {
        id: 'hu',
        languageId: 'hu',
        countryKo: '헝가리',
        countryNative: 'Magyarország',
        flag: 'hu',
        lat: 47.5,
        lon: 19.04,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '헝가리어과',
      },
    ],
  },
  {
    id: 'nl',
    nameKo: '네덜란드어',
    nameNative: 'Nederlands',
    code: 'NL',
    greeting: 'Hallo',
    greetingNative: 'Hallo',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'nl',
        languageId: 'nl',
        countryKo: '네덜란드',
        countryNative: 'Nederland',
        flag: 'nl',
        lat: 52.37,
        lon: 4.9,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '네덜란드어과',
      },
    ],
  },
  {
    id: 'sv',
    nameKo: '스웨덴어',
    nameNative: 'Svenska',
    code: 'SV',
    greeting: 'Hej',
    greetingNative: 'Hej',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'sv',
        languageId: 'sv',
        countryKo: '스웨덴',
        countryNative: 'Sverige',
        flag: 'se',
        lat: 59.33,
        lon: 18.07,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '스웨덴어과',
      },
    ],
  },
  {
    id: 'it',
    nameKo: '이탈리아어',
    nameNative: 'Italiano',
    code: 'IT',
    greeting: 'Ciao',
    greetingNative: 'Ciao',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'it',
        languageId: 'it',
        countryKo: '이탈리아',
        countryNative: 'Italia',
        flag: 'it',
        lat: 41.9,
        lon: 12.5,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '이탈리아어과',
      },
    ],
  },
  {
    id: 'el',
    nameKo: '그리스어',
    nameNative: 'Ελληνικά',
    code: 'EL',
    greeting: 'Yassou',
    greetingNative: 'Γεια σου',
    script: 'greek',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'el',
        languageId: 'el',
        countryKo: '그리스',
        countryNative: 'Ελλάδα',
        flag: 'gr',
        lat: 37.98,
        lon: 23.73,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '그리스어과',
      },
    ],
  },
  {
    id: 'cs',
    nameKo: '체코어',
    nameNative: 'Čeština',
    code: 'CS',
    greeting: 'Ahoj',
    greetingNative: 'Ahoj',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'cs',
        languageId: 'cs',
        countryKo: '체코',
        countryNative: 'Česko',
        flag: 'cz',
        lat: 50.08,
        lon: 14.44,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '체코어과',
      },
    ],
  },
  {
    id: 'uz',
    nameKo: '우즈베크어',
    nameNative: 'Oʻzbekcha',
    code: 'UZ',
    greeting: 'Salom',
    greetingNative: 'Salom',
    script: 'latin',
    official: true,
    region: 'asia',
    inCycle: false,
    pins: [
      {
        id: 'uz',
        languageId: 'uz',
        countryKo: '우즈베키스탄',
        countryNative: 'Oʻzbekiston',
        flag: 'uz',
        lat: 41.3,
        lon: 69.24,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '중앙아시아학과',
      },
    ],
  },
  {
    id: 'kk',
    nameKo: '카자흐어',
    nameNative: 'Қазақша',
    code: 'KK',
    greeting: 'Sälem',
    greetingNative: 'Сәлем',
    script: 'cyrillic',
    official: true,
    region: 'asia',
    inCycle: false,
    pins: [
      {
        id: 'kk',
        languageId: 'kk',
        countryKo: '카자흐스탄',
        countryNative: 'Қазақстан',
        flag: 'kz',
        lat: 51.17,
        lon: 71.45,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '중앙아시아학과',
      },
    ],
  },
  {
    id: 'th',
    nameKo: '태국어',
    nameNative: 'ไทย',
    code: 'TH',
    greeting: 'Sawasdee',
    greetingNative: 'สวัสดี',
    script: 'thai',
    official: true,
    region: 'asia',
    inCycle: false,
    pins: [
      {
        id: 'th',
        languageId: 'th',
        countryKo: '태국',
        countryNative: 'ประเทศไทย',
        flag: 'th',
        lat: 13.76,
        lon: 100.5,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '태국어과',
      },
    ],
  },
  {
    id: 'lo',
    nameKo: '라오스어',
    nameNative: 'ລາວ',
    code: 'LO',
    greeting: 'Sabaidee',
    greetingNative: 'ສະບາຍດີ',
    script: 'lao',
    official: true,
    region: 'asia',
    inCycle: false,
    pins: [
      {
        id: 'lo',
        languageId: 'lo',
        countryKo: '라오스',
        countryNative: 'ລາວ',
        flag: 'la',
        lat: 17.97,
        lon: 102.63,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '라오스어과',
      },
    ],
  },
  {
    id: 'az',
    nameKo: '아제르바이잔어',
    nameNative: 'Azərbaycanca',
    code: 'AZ',
    greeting: 'Salam',
    greetingNative: 'Salam',
    script: 'latin',
    official: true,
    region: 'mea',
    inCycle: false,
    pins: [
      {
        id: 'az',
        languageId: 'az',
        countryKo: '아제르바이잔',
        countryNative: 'Azərbaycan',
        flag: 'az',
        lat: 40.41,
        lon: 49.87,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '터키아제르바이잔어과',
      },
    ],
  },
  {
    id: 'fa',
    nameKo: '페르시아어',
    nameNative: 'فارسی',
    code: 'FA',
    greeting: 'Salaam',
    greetingNative: 'سلام',
    script: 'arabic',
    official: true,
    region: 'mea',
    inCycle: false,
    pins: [
      {
        id: 'fa',
        languageId: 'fa',
        countryKo: '이란',
        countryNative: 'ایران',
        flag: 'ir',
        lat: 35.69,
        lon: 51.39,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '이란어과',
      },
    ],
  },
  {
    id: 'uk',
    nameKo: '우크라이나어',
    nameNative: 'Українська',
    code: 'UK',
    greeting: 'Pryvit',
    greetingNative: 'Привіт',
    script: 'cyrillic',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'uk',
        languageId: 'uk',
        countryKo: '우크라이나',
        countryNative: 'Україна',
        flag: 'ua',
        lat: 50.45,
        lon: 30.52,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '우크라이나어과',
      },
    ],
  },
  {
    id: 'hr',
    nameKo: '크로아티아어',
    nameNative: 'Hrvatski',
    code: 'HR',
    greeting: 'Bok',
    greetingNative: 'Bok',
    script: 'latin',
    official: true,
    region: 'europe',
    inCycle: false,
    pins: [
      {
        id: 'hr',
        languageId: 'hr',
        countryKo: '크로아티아',
        countryNative: 'Hrvatska',
        flag: 'hr',
        lat: 45.81,
        lon: 15.98,
        status: 'coming_soon',
        statusLabel: '2027 개설 예정',
        note: '크로아티아어과',
      },
    ],
  },
];

export type PinWithLanguage = LanguagePin & { language: Language };

export const ALL_PINS: PinWithLanguage[] = LANGUAGES.flatMap((language) =>
  language.pins.map((pin) => ({ ...pin, language })),
);

/** 제목 인사말 순환 순서 — 요구사항에 명시된 순서 그대로 */
export const GREETING_CYCLE: Language[] = [
  'pt',
  'id',
  'vi',
  'tr',
  'hi',
  'mn',
  'sw',
  'pl',
  'hu',
]
  .map((id) => LANGUAGES.find((language) => language.id === id))
  .filter((language): language is Language => Boolean(language));

export const OFFICIAL_LANGUAGE_COUNT = LANGUAGES.filter((language) => language.official).length;

export const ADMISSION_QUOTA = 856;

export function getPinById(id: string): PinWithLanguage | undefined {
  return ALL_PINS.find((pin) => pin.id === id);
}

export function getLanguageById(id: string): Language | undefined {
  return LANGUAGES.find((language) => language.id === id);
}

export function getLanguagesByRegion(): { region: Region; label: string; languages: Language[] }[] {
  const order: Region[] = ['pilot', 'mea', 'asia', 'europe'];
  return order.map((region) => ({
    region,
    label: REGION_LABELS[region],
    languages: LANGUAGES.filter((language) => language.region === region),
  }));
}
