import type { PinScreen } from '../globe/GlobeScene';

type Candidate = {
  x: number;
  y: number;
  side: 'right' | 'left' | 'top' | 'bottom';
};

const GAP = 18;
const MARGIN = 14;
const HEADER = 84;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 핀 주변 네 방향 후보 중 다른 핀·화면 밖과 가장 덜 겹치는 위치를 고릅니다.
 */
export function placeTooltip(
  element: HTMLElement,
  pin: PinScreen,
  others: PinScreen[],
): void {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (!width || !height) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxX = vw - width - MARGIN;
  const maxY = vh - height - MARGIN;

  const candidates: Candidate[] = [
    { x: pin.x + GAP, y: pin.y - height / 2, side: 'right' },
    { x: pin.x - width - GAP, y: pin.y - height / 2, side: 'left' },
    { x: pin.x - width / 2, y: pin.y - height - GAP, side: 'top' },
    { x: pin.x - width / 2, y: pin.y + GAP, side: 'bottom' },
    { x: pin.x + GAP * 0.75, y: pin.y - height - GAP * 0.35, side: 'right' },
    { x: pin.x - width - GAP * 0.75, y: pin.y - height - GAP * 0.35, side: 'left' },
  ];

  const textZoneRight = Math.min(660, vw * 0.48);
  const textZoneBottom = vh - 60;

  let best = candidates[0];
  let bestScore = Number.POSITIVE_INFINITY;
  let bestX = 0;
  let bestY = 0;

  for (const candidate of candidates) {
    const x = clamp(candidate.x, MARGIN, maxX);
    const y = clamp(candidate.y, HEADER, maxY);
    const outX = Math.max(0, MARGIN - candidate.x, candidate.x - maxX);
    const outY = Math.max(0, HEADER - candidate.y, candidate.y - maxY);
    let score = (outX + outY) * 8;

    // 다른 핀과의 거리
    for (const other of others) {
      if (other.id === pin.id || !other.front) continue;
      const closestX = clamp(other.x, x, x + width);
      const closestY = clamp(other.y, y, y + height);
      const distance = Math.hypot(other.x - closestX, other.y - closestY);
      if (distance < 26) score += (26 - distance) * 5;
    }

    // 왼쪽 텍스트 영역을 가리는 정도
    const overlapX = Math.max(0, Math.min(x + width, textZoneRight) - Math.max(x, MARGIN));
    const overlapY = Math.max(0, Math.min(y + height, textZoneBottom) - Math.max(y, HEADER));
    score += (overlapX * overlapY) / 700;

    if (candidate.side === 'right') score += 0;
    if (candidate.side === 'left') score += 3;
    if (candidate.side === 'top') score += 5;
    if (candidate.side === 'bottom') score += 7;

    if (score < bestScore) {
      bestScore = score;
      best = candidate;
      bestX = x;
      bestY = y;
    }
  }

  element.style.transform = `translate3d(${Math.round(bestX)}px, ${Math.round(bestY)}px, 0)`;
  element.dataset.side = best.side;

  if (best.side === 'right' || best.side === 'left') {
    element.style.setProperty('--arrow-y', `${clamp(pin.y - bestY, 18, height - 18)}px`);
  } else {
    element.style.setProperty('--arrow-x', `${clamp(pin.x - bestX, 18, width - 18)}px`);
  }
}
