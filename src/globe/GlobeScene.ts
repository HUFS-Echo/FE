import { ALL_PINS, type PinWithLanguage } from '../config/languages';
import { COLORS, TUNING, type Quality } from '../config/tuning';
import world from './world.json';

export type PinScreen = {
  id: string;
  x: number;
  y: number;
  front: boolean;
  visible: boolean;
};

export type GlobeCallbacks = {
  onReady?: () => void;
  onHoverChange?: (pinId: string | null) => void;
  onSelectPin?: (pinId: string) => void;
};

type Vector = { x: number; y: number; z: number };
type Projection = { x: number; y: number; depth: number };
type PinPoint = { pin: PinWithLanguage; vector: Vector };

const RAD = Math.PI / 180;
const TAU = Math.PI * 2;
const INITIAL_LONGITUDE = TUNING.globe.initialLongitude;
const BASE_PITCH = TUNING.globe.referencePitch;
const WORLD = world as number[][][][];

function vectorFromGeo(lon: number, lat: number): Vector {
  const longitude = lon * RAD;
  const latitude = lat * RAD;
  const cosLat = Math.cos(latitude);
  return {
    x: cosLat * Math.sin(longitude),
    y: Math.sin(latitude),
    z: cosLat * Math.cos(longitude),
  };
}

function buildLandDots(): Vector[] {
  const mask = document.createElement('canvas');
  mask.width = TUNING.globe.landMaskWidth;
  mask.height = TUNING.globe.landMaskHeight;
  const maskContext = mask.getContext('2d');
  if (!maskContext) return [];

  for (const polygon of WORLD) {
    maskContext.beginPath();
    for (const ring of polygon) {
      ring.forEach(([lon, lat], index) => {
        const x = (lon + 180) * (mask.width / 360);
        const y = (90 - lat) * (mask.height / 180);
        if (index === 0) maskContext.moveTo(x, y);
        else maskContext.lineTo(x, y);
      });
      maskContext.closePath();
    }
    maskContext.fill('evenodd');
  }

  const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
  const dots: Vector[] = [];
  const latStep = TUNING.globe.landMaskLatStep;
  const lonStepBase = TUNING.globe.landMaskLonStep;

  for (let lat = -81; lat < 84; lat += latStep) {
    const lonStep = lonStepBase / Math.cos(lat * RAD);
    for (let lon = -179; lon < 180; lon += lonStep) {
      const x = Math.floor((lon + 180) * (mask.width / 360));
      const y = Math.floor((90 - lat) * (mask.height / 180));
      const alpha = pixels[4 * (y * mask.width + x) + 3];
      if (alpha > 120) dots.push(vectorFromGeo(lon, lat));
    }
  }
  return dots;
}

function hexRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
}

export class GlobeScene {
  private readonly container: HTMLElement;
  private readonly quality: Quality;
  private readonly callbacks: GlobeCallbacks;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly resizeObserver: ResizeObserver;
  private readonly dots: Vector[];
  private readonly pins: PinPoint[] = ALL_PINS.map((pin) => ({
    pin,
    vector: vectorFromGeo(pin.lon, pin.lat),
  }));
  private readonly dotRgb = hexRgb(COLORS.dotNear);

  private longitude = INITIAL_LONGITUDE;
  private targetLongitude: number | null = null;
  private pitch: number = BASE_PITCH;
  private targetPitch: number = BASE_PITCH;
  private followSelection = true;
  private activePinId: string | null = null;
  private hoveredPinId: string | null = null;
  private pointerDown = false;
  private pointerId = -1;
  private lastPointer = { x: 0, y: 0 };
  private dragDistance = 0;
  private previousFrame = 0;
  private logicalSize = 0;
  private pixelRatio = 1;
  private frameId = 0;
  private running = false;
  private disposed = false;
  private ready = false;
  private motionStarted = false;

  constructor(container: HTMLElement, quality: Quality, callbacks: GlobeCallbacks = {}) {
    this.container = container;
    this.quality = quality;
    this.callbacks = callbacks;
    this.dots = buildLandDots().filter((_, index) =>
      Math.floor((index + 1) * quality.dotRatio) > Math.floor(index * quality.dotRatio),
    );
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Canvas 2D is unavailable');
    this.context = context;
    this.canvas.className = 'globe-canvas';
    this.canvas.setAttribute(
      'aria-label',
      '점묘형 인터랙티브 지구본. 드래그해 회전하고, 도시 점에 마우스를 올리면 해당 언어 인사말을 볼 수 있습니다.',
    );
    this.canvas.setAttribute('role', 'img');
    container.appendChild(this.canvas);

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.startLoop();
  }

  private resize(): void {
    const width = this.container.clientWidth || 0;
    if (!width) return;
    const maxDpr = Math.min(2, this.quality.dprMax);
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const size = Math.round(width * dpr);
    this.logicalSize = width;
    this.pixelRatio = dpr;
    if (this.canvas.width !== size || this.canvas.height !== size) {
      this.canvas.width = size;
      this.canvas.height = size;
    }
  }

  private project(vector: Vector): Projection {
    const longitude = this.longitude * RAD;
    const pitch = this.pitch * RAD;
    const cosLongitude = Math.cos(longitude);
    const sinLongitude = Math.sin(longitude);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const rotatedZ = vector.x * sinLongitude + vector.z * cosLongitude;
    const center = this.logicalSize / 2;
    const radius = this.logicalSize * TUNING.globe.referenceRadiusRatio;

    return {
      x: center + radius * (vector.x * cosLongitude - vector.z * sinLongitude),
      y: center - radius * (vector.y * cosPitch - rotatedZ * sinPitch),
      depth: vector.y * sinPitch + rotatedZ * cosPitch,
    };
  }

  private draw(now: number): void {
    if (!this.logicalSize) return;
    const { context: ctx } = this;
    const size = this.canvas.width;
    const dpr = this.pixelRatio;
    const width = this.logicalSize;
    const center = width / 2;
    const radius = width * TUNING.globe.referenceRadiusRatio;

    if (this.targetLongitude !== null && this.followSelection) {
      const delta = ((this.targetLongitude - this.longitude + 540) % 360) - 180;
      const elapsed = Math.min(now - this.previousFrame, 100);
      const easing = this.quality.reducedMotion
        ? 1
        : 1 - Math.exp(-elapsed / TUNING.globe.referenceRotationEaseMs);
      this.longitude += delta * easing;
    }
    if (this.targetPitch !== this.pitch) {
      const elapsed = Math.min(now - this.previousFrame, 100);
      const easing = this.quality.reducedMotion
        ? 1
        : 1 - Math.exp(-elapsed / TUNING.globe.referenceRotationEaseMs);
      this.pitch += (this.targetPitch - this.pitch) * easing;
    }
    this.previousFrame = now;

    ctx.clearRect(0, 0, size, size);
    const sea = ctx.createRadialGradient(
      (center - radius * 0.46) * dpr,
      (center - radius * 0.49) * dpr,
      0,
      center * dpr,
      center * dpr,
      radius * dpr,
    );
    sea.addColorStop(0, COLORS.ocean);
    sea.addColorStop(0.65, COLORS.oceanLift);
    sea.addColorStop(0.97, COLORS.atmosphereInner);
    sea.addColorStop(1, COLORS.atmosphereOuter);
    ctx.fillStyle = sea;
    ctx.beginPath();
    ctx.arc(center * dpr, center * dpr, radius * dpr, 0, TAU);
    ctx.fill();

    const dotRadius = radius * TUNING.globe.referenceDotRadius;
    const [red, green, blue] = this.dotRgb;
    for (const dot of this.dots) {
      const projected = this.project(dot);
      if (projected.depth <= 0) continue;
      ctx.fillStyle = `rgba(${red},${green},${blue},${0.21 + 0.59 * projected.depth})`;
      ctx.beginPath();
      ctx.arc(projected.x * dpr, projected.y * dpr, dotRadius * dpr, 0, TAU);
      ctx.fill();
    }

    this.pins.forEach(({ pin, vector }) => {
      const projected = this.project(vector);
      if (projected.depth <= 0) return;
      const active = pin.id === this.activePinId;
      ctx.fillStyle = active ? COLORS.pinActive : COLORS.pinComing;
      ctx.beginPath();
      ctx.arc(
        projected.x * dpr,
        projected.y * dpr,
        radius * (active ? TUNING.globe.referenceActiveCityRadius : TUNING.globe.referenceCityRadius) * dpr,
        0,
        TAU,
      );
      ctx.fill();

      if (!active) return;
      const reducedMotion = this.quality.reducedMotion;
      const pulse = !reducedMotion && this.motionStarted
        ? TUNING.globe.referenceCityRingPulse * Math.sin(now / TUNING.globe.referenceCityRingPeriodMs)
        : 0;
      const ringRadius = reducedMotion
        ? TUNING.globe.referenceCityRingReducedRadius
        : TUNING.globe.referenceCityRingRadius + pulse;
      ctx.strokeStyle = `${COLORS.pinActive}80`;
      ctx.lineWidth = radius * TUNING.globe.referenceCityRingLine * dpr;
      ctx.beginPath();
      ctx.arc(
        projected.x * dpr,
        projected.y * dpr,
        radius * ringRadius * dpr,
        0,
        TAU,
      );
      ctx.stroke();
    });
  }

  private tick = (now: number): void => {
    if (!this.running || this.disposed) return;
    this.resize();
    this.draw(now);
    if (!this.ready) {
      this.ready = true;
      this.callbacks.onReady?.();
    }
    this.frameId = requestAnimationFrame(this.tick);
  };

  private startLoop(): void {
    if (this.disposed || this.running) return;
    this.running = true;
    this.previousFrame = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  private onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop();
    else this.startLoop();
  };

  private hitTest(clientX: number, clientY: number): string | null {
    const rect = this.canvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const hitRadius = Math.max(10, this.logicalSize * TUNING.globe.referenceCityHitRadius);
    let nearestId: string | null = null;
    let nearestDistance = hitRadius;

    for (const { pin, vector } of this.pins) {
      const projected = this.project(vector);
      if (projected.depth <= 0) continue;
      const distance = Math.hypot(projected.x - localX, projected.y - localY);
      if (distance <= nearestDistance) {
        nearestDistance = distance;
        nearestId = pin.id;
      }
    }
    return nearestId;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.pointerDown = true;
    this.pointerId = event.pointerId;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.dragDistance = 0;
    this.followSelection = false;
    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in a few embedded browsers.
    }
    this.canvas.style.cursor = 'grabbing';
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.pointerDown) {
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.dragDistance += Math.abs(dx) + Math.abs(dy);
      if (this.dragDistance > 2) {
        this.longitude += dx * 0.298;
        const limit = TUNING.view.pitchLimit;
        this.targetPitch = Math.max(limit * -1, Math.min(limit, this.targetPitch - dy * 0.24));
      }
      return;
    }
    if (event.pointerType === 'touch') return;

    const id = this.hitTest(event.clientX, event.clientY);
    if (id !== this.hoveredPinId) {
      this.hoveredPinId = id;
      this.callbacks.onHoverChange?.(id);
      this.canvas.style.cursor = id ? 'pointer' : 'grab';
    }
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.pointerDown || (this.pointerId !== -1 && event.pointerId !== this.pointerId)) return;
    const wasClick = this.dragDistance < 6;
    this.pointerDown = false;
    try {
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore a release after the browser already canceled the pointer.
    }
    this.pointerId = -1;
    this.canvas.style.cursor = 'grab';
    if (wasClick) {
      const id = this.hitTest(event.clientX, event.clientY);
      if (id) this.callbacks.onSelectPin?.(id);
    }
  };

  private onPointerLeave = (): void => {
    if (this.pointerDown) return;
    if (this.hoveredPinId) {
      this.hoveredPinId = null;
      this.callbacks.onHoverChange?.(null);
    }
  };

  setActivePin(id: string | null): void {
    this.activePinId = id;
    const selected = this.pins.find(({ pin }) => pin.id === id);
    if (selected) {
      this.targetLongitude = selected.pin.lon;
      this.followSelection = true;
    }
  }

  startMotion(): void {
    this.motionStarted = true;
  }

  setPaused(paused: boolean): void {
    if (paused) this.stopLoop();
    else this.startLoop();
  }

  focusPin(id: string): void {
    const selected = this.pins.find(({ pin }) => pin.id === id);
    if (!selected) return;
    this.targetLongitude = selected.pin.lon;
    this.targetPitch = BASE_PITCH;
    this.followSelection = true;
  }

  resetView(): void {
    this.targetLongitude = INITIAL_LONGITUDE;
    this.targetPitch = BASE_PITCH;
    this.followSelection = true;
  }

  private pinScreen(pin: PinPoint): PinScreen {
    const rect = this.canvas.getBoundingClientRect();
    const projected = this.project(pin.vector);
    const x = rect.left + projected.x;
    const y = rect.top + projected.y;
    const visible =
      projected.depth > 0 &&
      projected.x >= 8 &&
      projected.x <= rect.width - 8 &&
      projected.y >= 8 &&
      projected.y <= rect.height - 8;
    return { id: pin.pin.id, x, y, front: projected.depth > 0, visible };
  }

  getPinScreen(id: string): PinScreen | null {
    const pin = this.pins.find((item) => item.pin.id === id);
    return pin ? this.pinScreen(pin) : null;
  }

  getAllPinScreens(): PinScreen[] {
    return this.pins.map((pin) => this.pinScreen(pin));
  }

  dispose(): void {
    this.disposed = true;
    this.stopLoop();
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.canvas.parentElement === this.container) this.container.removeChild(this.canvas);
  }
}
