/**
 * HUFS Echo — tuning
 *
 * 이 파일 하나에서 인트로의 속도, 개수, 색상을 조절합니다.
 * CSS는 `applyTheme()`이 주입하는 `--c-*` 변수를 사용하고,
 * WebGL은 `COLORS`를 직접 읽습니다. 값을 바꾸면 둘 다 함께 바뀝니다.
 */

export const COLORS = {
  bgTop: '#0B1530',
  bgBottom: '#13213D',
  ink: '#EAF0FF',
  muted: '#93A4C8',
  faint: '#5E7195',
  echo: '#5B8DEF',
  echoBright: '#9CCBFF',
  dotNear: '#D8E8FF',
  dotFar: '#7FA8EA',
  atmosphereInner: '#2856A8',
  atmosphereOuter: '#5B8DEF',
  ocean: '#071023',
  oceanLift: '#0D2140',
  pinComing: '#E6EEFC',
  pinActive: '#5B8DEF',
  pinActiveCore: '#CDE4FF',
  arcActive: '#9CD6FF',
  arcIdle: '#6FA8F5',
  azulejo: '#2E5FA3',
  azulejoLight: '#EAF2FF',
  success: '#7FE0C0',
  warning: '#FFC98B',
  danger: '#FF9A8B',
} as const;

export type ColorKey = keyof typeof COLORS;

export const TUNING = {
  /** 지구본이 처음 바라보는 좌표. 서울과 리스본이 함께 보이는 지점. */
  view: {
    lat: 24,
    lon: 60,
    /** 드래그로 돌릴 수 있는 상하 한계(도) */
    pitchLimit: 55,
    /** 사용자가 아무것도 하지 않을 때의 아주 느린 표류(라디안) */
    driftYaw: 0.016,
    driftPitch: 0.01,
    driftSpeed: 0.11,
  },

  /** 1.5초 진입 시퀀스 (ms) */
  intro: {
    total: 1600,
    globeDelay: 160,
    eyebrowDelay: 380,
    titleDelay: 520,
    title2Delay: 650,
    bodyDelay: 800,
    statsDelay: 930,
    ctaDelay: 1080,
    hintDelay: 1300,
    /** 이 시점부터 빛 줄기·인사말 순환이 시작됩니다. */
    motionStart: 1550,
  },

  /** 배경 별 파티클 */
  stars: {
    count: 150,
    lowEndCount: 55,
    minRadius: 0.35,
    maxRadius: 1.35,
    twinkleSpeed: 0.32,
    driftSpeed: 0.006,
    /** 큰 별(십자 반짝임)의 비율 */
    sparkleRatio: 0.08,
  },

  /** 지구본 */
  globe: {
    /** 화면에서 도트 하나의 크기(CSS px). 모바일은 자동으로 줄어듭니다. */
    dotPx: 3.1,
    dotPxMobile: 1.9,
    /** 저사양에서 사용할 도트 비율 */
    lowEndDotRatio: 0.58,
    mobileDotRatio: 0.46,
    /** 대기 글로우 구체의 반지름 */
    atmosphereRadius: 1.075,
    /** 외곽 헤일로 스프라이트 크기 */
    haloSize: 2.75,
    /** 지구본 본체(바다) 반지름 */
    oceanRadius: 0.997,
    /** 카메라 프러스텀 절반 높이. 0.997 반지름의 구체가 정사각형 박스의 약 81%를 차지합니다. */
    frustumHalf: 1.23,
    /** DPR 상한 */
    dprMax: 2,
    dprMaxLow: 1.5,
  },

  /** 핀 */
  pins: {
    activeRadius: 0.0135,
    activeCoreRadius: 0.0075,
    comingRadius: 0.0052,
    hitRadius: 0.048,
    activeGlow: 0.105,
    comingGlow: 0.038,
    pulseDuration: 2.6,
    pulseMaxScale: 3.6,
    /** 이 값보다 정면성이 낮으면 뒤쪽으로 판단 */
    frontThreshold: 0.06,
  },

  /** 서울 → 세계로 뻗는 빛 */
  arcs: {
    /** 포르투갈 하이라이트 노선 줄기 굵기 */
    activeRadius: 0.0072,
    /** 공식 언어의 은은한 연결 노선 줄기 굵기 */
    idleRadius: 0.0024,
    /** 포르투갈 노선을 따라 동시에 흐르는 빛 패킷 수 */
    activePackets: 3,
    /** active 패킷 속도(초당 1회전 비율) */
    activeSpeed: 0.19,
    /** active 꼬리 길이(0~1) */
    activeTrail: 0.3,
    /** 순차 발사 간격(ms) */
    staggerMs: 430,
    /** 한 줄기가 서울에서 목적지까지 가는 시간(ms) */
    travelMs: 1550,
    /** 한 바퀴를 마친 뒤 쉬는 시간(ms) */
    cyclePauseMs: 1400,
    /** 순차 발사에 참여하는 최대 줄기 수 (저사양 자동 축소) */
    sequenceLimit: 21,
    sequenceLimitLow: 20,
    /** 지나간 자리의 희미한 경로 불투명도 */
    baseOpacity: 0.035,
    activeBaseOpacity: 0.12,
    /** 포물선 높이 */
    lift: 0.42,
  },

  /** 서울 리플 */
  ripple: {
    count: 3,
    intervalMs: 2400,
    durationMs: 2600,
    maxRadius: 0.175,
    opacity: 0.55,
  },

  /** 마우스 패럴랙스 */
  parallax: {
    maxX: 5,
    maxY: 7,
    ease: 0.055,
  },

  /** 인사말 타자기 */
  greeting: {
    typeMs: 55,
    eraseMs: 26,
    holdMs: 1250,
    gapMs: 240,
    /** 핀에서 마우스가 떨어졌을 때 순환으로 돌아가기까지 */
    resumeMs: 180,
  },

  /** CTA 마그네틱 */
  magnetic: {
    radius: 170,
    pull: 0.3,
    maxPull: 14,
  },

  /** 숫자 카운트업 */
  countUp: {
    durationMs: 1450,
  },
} as const;

export type Quality = {
  lowEnd: boolean;
  mobile: boolean;
  reducedMotion: boolean;
  webgl: boolean;
  dotRatio: number;
  dotPx: number;
  starCount: number;
  arcLimit: number;
  dprMax: number;
};

let cachedQuality: Quality | null = null;

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function getQuality(): Quality {
  if (cachedQuality) return cachedQuality;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const lowEnd = mobile || cores <= 4 || memory <= 4;
  const webgl = supportsWebGL();

  cachedQuality = {
    lowEnd,
    mobile,
    reducedMotion,
    webgl,
    dotRatio: mobile
      ? TUNING.globe.mobileDotRatio
      : lowEnd
        ? TUNING.globe.lowEndDotRatio
        : 1,
    dotPx: mobile ? TUNING.globe.dotPxMobile : TUNING.globe.dotPx,
    starCount: lowEnd ? TUNING.stars.lowEndCount : TUNING.stars.count,
    arcLimit: lowEnd ? TUNING.arcs.sequenceLimitLow : TUNING.arcs.sequenceLimit,
    dprMax: lowEnd ? TUNING.globe.dprMaxLow : TUNING.globe.dprMax,
  };
  return cachedQuality;
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** COLORS를 CSS 변수로 주입합니다. base.css의 fallback과 같은 값입니다. */
export function applyTheme(): void {
  const root = document.documentElement;
  (Object.keys(COLORS) as ColorKey[]).forEach((key) => {
    root.style.setProperty(`--c-${kebab(key)}`, COLORS[key]);
  });
}

export function formatCoord(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}
