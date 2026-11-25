import * as THREE from 'three';
import { ALL_PINS, type PinWithLanguage } from '../config/languages';
import { COLORS, TUNING, type Quality } from '../config/tuning';
import landDots from './landDots.json';
import { DEG, easeOutCubic, latLonToVector3 } from './geo';

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

type PinObject = {
  pin: PinWithLanguage;
  group: THREE.Group;
  hit: THREE.Mesh;
  core: THREE.Mesh;
  ring?: THREE.Mesh;
  phase: number;
  front: boolean;
};

type ArcObject = {
  pinId: string;
  included: boolean;
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  active: boolean;
  launchAt: number | null;
  progress: number;
};

type RippleObject = {
  mesh: THREE.Mesh;
  startAt: number | null;
  phase: number;
};

const DOTS_VERTEX = /* glsl */ `
  attribute float aScale;
  attribute float aSeed;
  uniform float uDotPx;
  uniform float uPixelRatio;
  varying float vFacing;
  varying float vSeed;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(position));
    vFacing = worldNormal.z;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * world;
    gl_PointSize = uDotPx * uPixelRatio * aScale;
  }
`;

const DOTS_FRAGMENT = /* glsl */ `
  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform float uTime;
  varying float vFacing;
  varying float vSeed;

  void main() {
    if (vFacing < 0.015) discard;
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float alpha = smoothstep(0.5, 0.16, d);
    float twinkle = 1.0;
    vec3 color = mix(uFar, uNear, smoothstep(0.0, 0.92, vFacing));
    float facingOpacity = mix(0.21, 0.80, smoothstep(0.0, 0.92, vFacing));
    gl_FragColor = vec4(color, alpha * facingOpacity * twinkle);
  }
`;

const OCEAN_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vPosition = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const OCEAN_FRAGMENT = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uLift;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    float radius = length(vPosition.xy - vec2(-0.46, 0.49));
    float gradient = clamp(radius / 1.95, 0.0, 1.0);
    vec3 color = mix(uDeep, uLift, smoothstep(0.0, 0.65, gradient));
    color = mix(color, uRim, smoothstep(0.65, 0.97, gradient));
    color = mix(color, vec3(0.5451, 0.7255, 0.6980), smoothstep(0.97, 1.0, gradient));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uInner;
  uniform vec3 uOuter;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.1);
    vec3 color = mix(uInner, uOuter, smoothstep(0.0, 0.85, rim));
    gl_FragColor = vec4(color, rim * uOpacity);
  }
`;

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(220,238,255,0.92)');
  gradient.addColorStop(0.46, 'rgba(120,180,255,0.32)');
  gradient.addColorStop(1, 'rgba(80,140,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawSeoulLabel(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '500 38px "IBM Plex Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(91,141,239,0.9)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#DCE9FF';
  ctx.fillText('S E O U L', w / 2, h / 2 - 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(156,203,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 34, h - 18);
  ctx.lineTo(w / 2 + 34, h - 18);
  ctx.stroke();
}

export class GlobeScene {
  private container: HTMLElement;
  private quality: Quality;
  private callbacks: GlobeCallbacks;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private tiltGroup = new THREE.Group();
  private pitchGroup = new THREE.Group();
  private yawGroup = new THREE.Group();

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pins: PinObject[] = [];
  private arcs: ArcObject[] = [];
  private ripples: RippleObject[] = [];
  private dotMaterial: THREE.ShaderMaterial | null = null;
  private arcTimeUniforms: THREE.IUniform[] = [];

  private baseYaw = -TUNING.view.lon * DEG;
  private basePitch = TUNING.view.lat * DEG;
  private dragYaw = 0;
  private dragPitch = 0;
  private focusTarget: { yaw: number; pitch: number } | null = null;
  private parallax = { x: 0, y: 0 };
  private parallaxTarget = { x: 0, y: 0 };

  private pointerDown = false;
  private pointerId = -1;
  private lastPointer = { x: 0, y: 0 };
  private dragMoved = 0;
  private hovered: string | null = null;

  private time = 0;
  private lastFrame = 0;
  private frameId = 0;
  private running = false;
  private disposed = false;
  private ready = false;
  private motionStarted = false;
  private paused = false;

  private nextArcAt = 0;
  private arcCursor = 0;
  private cycleRestartAt = 0;
  private rippleCursor = 0;
  private lastRippleAt = 0;

  private resizeObserver: ResizeObserver;
  private glowTexture: THREE.CanvasTexture;
  private seoulAnchor: THREE.Group | null = null;
  private seoulCanvas: HTMLCanvasElement | null = null;
  private seoulTexture: THREE.CanvasTexture | null = null;
  private disposables: Array<{ dispose: () => void }> = [];

  constructor(container: HTMLElement, quality: Quality, callbacks: GlobeCallbacks = {}) {
    this.container = container;
    this.quality = quality;
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: quality.lowEnd ? 'low-power' : 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dprMax));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'globe-canvas';
    this.renderer.domElement.setAttribute(
      'aria-label',
      '서울에서 세계로 뻗어 나가는 빛을 표현한 인터랙티브 도트 지구본. 드래그해 회전하고, 언어 핀에 마우스를 올리면 인사말이 바뀝니다.',
    );
    this.renderer.domElement.setAttribute('role', 'img');
    container.appendChild(this.renderer.domElement);

    const half = TUNING.globe.frustumHalf;
    this.camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 10);
    this.camera.position.set(0, 0, 3);

    this.scene.add(this.tiltGroup);
    this.tiltGroup.add(this.pitchGroup);
    this.pitchGroup.add(this.yawGroup);
    this.pitchGroup.rotation.x = this.basePitch;
    this.yawGroup.rotation.y = this.baseYaw;

    this.glowTexture = makeGlowTexture();
    this.disposables.push(this.glowTexture);

    this.buildGlobe();
    this.buildPins();
    this.bindEvents();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.running = true;
    this.lastFrame = performance.now();
    this.frameId = requestAnimationFrame(this.tick);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!this.disposed) this.refreshSeoulLabel();
      });
    }
  }

  private track<T extends { dispose: () => void }>(item: T): T {
    this.disposables.push(item);
    return item;
  }

  private buildGlobe(): void {
    const oceanGeometry = this.track(new THREE.SphereGeometry(TUNING.globe.oceanRadius, 96, 96));
    const oceanMaterial = this.track(
      new THREE.ShaderMaterial({
        vertexShader: OCEAN_VERTEX,
        fragmentShader: OCEAN_FRAGMENT,
        uniforms: {
          uDeep: { value: new THREE.Color(COLORS.ocean) },
          uLift: { value: new THREE.Color(COLORS.oceanLift) },
          uRim: { value: new THREE.Color(COLORS.atmosphereInner) },
        },
        depthWrite: true,
      }),
    );
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.renderOrder = 0;
    this.yawGroup.add(ocean);

    const positions: number[] = [];
    const scales: number[] = [];
    const seeds: number[] = [];
    const dots = landDots as number[][];
    let accumulator = 0;
    const ratio = this.quality.dotRatio;

    for (let i = 0; i < dots.length; i += 1) {
      accumulator += ratio;
      if (accumulator < 1) continue;
      accumulator -= 1;
      const [lat, lon] = dots[i];
      const point = latLonToVector3(lat, lon, 1.0015);
      positions.push(point.x, point.y, point.z);
      const pseudo = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      scales.push(0.78 + pseudo * 0.44);
      seeds.push(pseudo);
    }

    const geometry = this.track(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));

    this.dotMaterial = this.track(
      new THREE.ShaderMaterial({
        vertexShader: DOTS_VERTEX,
        fragmentShader: DOTS_FRAGMENT,
        uniforms: {
          uNear: { value: new THREE.Color(COLORS.dotNear) },
          uFar: { value: new THREE.Color(COLORS.dotFar) },
          uTime: { value: 0 },
          uDotPx: { value: this.quality.dotPx },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    );
    const points = new THREE.Points(geometry, this.dotMaterial);
    points.frustumCulled = false;
    points.renderOrder = 1;
    this.yawGroup.add(points);

    const atmosphereGeometry = this.track(
      new THREE.SphereGeometry(TUNING.globe.atmosphereRadius, 96, 96),
    );
    const atmosphereMaterial = this.track(
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        uniforms: {
          uInner: { value: new THREE.Color(COLORS.atmosphereInner) },
          uOuter: { value: new THREE.Color(COLORS.atmosphereOuter) },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.renderOrder = 5;
    this.yawGroup.add(atmosphere);

    const halo = new THREE.Sprite(
      this.track(
        new THREE.SpriteMaterial({
          map: this.glowTexture,
          color: new THREE.Color(COLORS.atmosphereOuter),
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    halo.scale.setScalar(TUNING.globe.haloSize);
    halo.position.set(0, 0, -0.55);
    halo.renderOrder = -1;
    this.yawGroup.add(halo);
  }

  private buildPins(): void {
    const ringGeometry = this.track(new THREE.RingGeometry(0.018, 0.021, 48));
    const hitGeometry = this.track(new THREE.SphereGeometry(TUNING.pins.hitRadius, 8, 8));
    const hitMaterial = this.track(
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    );

    ALL_PINS.forEach((pin, index) => {
      const normal = latLonToVector3(pin.lat, pin.lon, 1).normalize();
      const group = new THREE.Group();
      group.position.copy(normal).multiplyScalar(1.004);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      group.renderOrder = 4;

      const core = new THREE.Mesh(
        this.track(new THREE.SphereGeometry(TUNING.pins.comingRadius, 18, 18)),
        this.track(new THREE.MeshBasicMaterial({ color: '#8D7150', toneMapped: false })),
      );
      group.add(core);

      const ring = new THREE.Mesh(
        ringGeometry,
        this.track(new THREE.MeshBasicMaterial({
          color: '#002D56',
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          side: THREE.DoubleSide,
        })),
      );
      ring.position.z = 0.001;
      ring.visible = false;
      group.add(ring);

      const hit = new THREE.Mesh(hitGeometry, hitMaterial);
      hit.userData.pinId = pin.id;
      group.add(hit);
      this.yawGroup.add(group);
      this.pins.push({ pin, group, hit, core, ring, phase: (index * 0.37) % 1, front: false });
    });
  }

  setActivePin(id: string | null): void {
    this.pins.forEach((pin) => {
      const active = pin.pin.id === id;
      pin.core.scale.setScalar(active ? TUNING.pins.activeRadius / TUNING.pins.comingRadius : 1);
      (pin.core.material as THREE.MeshBasicMaterial).color.set(active ? '#002D56' : '#8D7150');
      if (pin.ring) pin.ring.visible = active;
    });
  }

  private bindEvents(): void {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onWindowPointerMove = (event: PointerEvent): void => {
    if (this.quality.reducedMotion || this.quality.mobile) return;
    this.parallaxTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.parallaxTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  private updatePointer(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private hitTest(): string | null {
    this.updatePointerFromLast();
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = this.pins.filter((pin) => pin.front).map((pin) => pin.hit);
    const intersections = this.raycaster.intersectObjects(targets, false);
    if (intersections.length === 0) return null;
    const id = intersections[0].object.userData.pinId as string | undefined;
    return id ?? null;
  }

  private lastClient = { x: 0, y: 0 };

  private updatePointerFromLast(): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((this.lastClient.x - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((this.lastClient.y - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.pointerDown = true;
    this.pointerId = event.pointerId;
    this.dragMoved = 0;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.lastClient = { x: event.clientX, y: event.clientY };
    this.focusTarget = null;
    this.renderer.domElement.setPointerCapture(event.pointerId);
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private onPointerMove = (event: PointerEvent): void => {
    this.lastClient = { x: event.clientX, y: event.clientY };
    this.updatePointer(event);

    if (this.pointerDown) {
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      if (this.dragMoved > 2) {
        this.dragYaw += dx * 0.0052;
        const limit = TUNING.view.pitchLimit * DEG;
        this.dragPitch = Math.max(-limit, Math.min(limit, this.dragPitch + dy * 0.0042));
      }
      return;
    }

    if (event.pointerType === 'touch') return;

    const id = this.hitTest();
    if (id !== this.hovered) {
      this.hovered = id;
      this.callbacks.onHoverChange?.(id);
      this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
    }
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.pointerDown) return;
    const wasClick = this.dragMoved < 6;
    this.pointerDown = false;
    if (this.pointerId >= 0) {
      try {
        this.renderer.domElement.releasePointerCapture(this.pointerId);
      } catch {
        /* noop */
      }
    }
    this.pointerId = -1;
    this.renderer.domElement.style.cursor = 'grab';

    if (wasClick) {
      this.lastClient = { x: event.clientX, y: event.clientY };
      const id = this.hitTest();
      if (id) this.callbacks.onSelectPin?.(id);
    }
  };

  private onPointerLeave = (): void => {
    if (this.pointerDown) return;
    if (this.hovered) {
      this.hovered = null;
      this.callbacks.onHoverChange?.(null);
    }
  };

  private onVisibilityChange = (): void => {
    if (document.hidden) {
      this.stopLoop();
    } else if (!this.paused) {
      this.startLoop();
    }
  };

  private resize(): void {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.dprMax));
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    const half = TUNING.globe.frustumHalf;
    this.camera.left = -half * aspect;
    this.camera.right = half * aspect;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
    if (this.dotMaterial) {
      this.dotMaterial.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
  }

  private tick = (now: number): void => {
    if (!this.running || this.disposed) return;
    this.frameId = requestAnimationFrame(this.tick);
    const dt = Math.min(0.05, Math.max(0, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.time += dt;
    const t = this.time;

    // focus / drag easing
    if (this.focusTarget) {
      const ease = 1 - Math.exp(-dt * 5.2);
      this.dragYaw += (this.focusTarget.yaw - this.dragYaw) * ease;
      this.dragPitch += (this.focusTarget.pitch - this.dragPitch) * ease;
      if (
        Math.abs(this.focusTarget.yaw - this.dragYaw) < 0.002 &&
        Math.abs(this.focusTarget.pitch - this.dragPitch) < 0.002
      ) {
        this.focusTarget = null;
      }
    }

    const driftFactor =
      this.quality.reducedMotion || this.focusTarget || this.pointerDown ? 0 : 1;
    const driftYaw = Math.sin(t * TUNING.view.driftSpeed) * TUNING.view.driftYaw * driftFactor;
    const driftPitch =
      Math.sin(t * TUNING.view.driftSpeed * 0.83 + 1.4) *
      TUNING.view.driftPitch *
      driftFactor;

    this.pitchGroup.rotation.x = this.basePitch + this.dragPitch + driftPitch;
    this.yawGroup.rotation.y = this.baseYaw + this.dragYaw + driftYaw;

    if (!this.quality.reducedMotion && !this.quality.mobile) {
      const ease = 1 - Math.pow(1 - TUNING.parallax.ease, dt * 60);
      this.parallax.x += (this.parallaxTarget.x - this.parallax.x) * ease;
      this.parallax.y += (this.parallaxTarget.y - this.parallax.y) * ease;
      this.tiltGroup.rotation.y = this.parallax.x * TUNING.parallax.maxY * DEG;
      this.tiltGroup.rotation.x = this.parallax.y * TUNING.parallax.maxX * DEG;
    }

    const motion = this.motionStarted && !this.quality.reducedMotion;

    if (this.dotMaterial) {
      this.dotMaterial.uniforms.uTime.value = motion ? t : 0;
    }

    // pins: front test + pulse
    this.pins.forEach((pin) => {
      const world = pin.group.getWorldPosition(this.tmpVec);
      const facing = world.clone().normalize().z;
      pin.front = facing > TUNING.pins.frontThreshold;
      pin.group.visible = pin.front;

    });

    // arcs
    this.arcTimeUniforms.forEach((uniform) => {
      uniform.value = motion ? t : 0;
    });

    if (motion) {
      if (this.nextArcAt === 0) this.nextArcAt = t + 0.4;
      const idleArcs = this.arcs.filter((arc) => !arc.active && arc.included).slice(0, this.quality.arcLimit);
      if (idleArcs.length > 0) {
        if (this.arcCursor >= idleArcs.length) {
          if (t >= this.cycleRestartAt) {
            this.arcCursor = 0;
            this.nextArcAt = t + 0.3;
          }
        } else if (t >= this.nextArcAt) {
          const arc = idleArcs[this.arcCursor];
          this.arcCursor += 1;
          arc.launchAt = t;
          arc.progress = 0;
          arc.uniforms.uProgress.value = 0;
          this.nextArcAt = t + TUNING.arcs.staggerMs / 1000;
          if (this.arcCursor >= idleArcs.length) {
            this.cycleRestartAt =
              t + TUNING.arcs.travelMs / 1000 + TUNING.arcs.cyclePauseMs / 1000;
          }
        }
      }

      this.arcs.forEach((arc) => {
        if (arc.active || arc.launchAt === null) return;
        const progress = (t - arc.launchAt) / (TUNING.arcs.travelMs / 1000);
        arc.uniforms.uProgress.value = progress;
        if (progress > 1.08) {
          arc.launchAt = null;
          arc.uniforms.uProgress.value = -1;
        }
      });
    }

    // seoul ripples
    this.updateRipples(t, motion);

    this.renderer.render(this.scene, this.camera);

    if (!this.ready) {
      this.ready = true;
      this.callbacks.onReady?.();
    }
  };

  private tmpVec = new THREE.Vector3();

  private updateRipples(t: number, motion: boolean): void {
    if (this.ripples.length === 0) return;

    if (!motion) {
      this.ripples.forEach((ripple, index) => {
        ripple.mesh.visible = true;
        ripple.mesh.scale.setScalar(0.05 + index * 0.045);
        (ripple.mesh.material as THREE.MeshBasicMaterial).opacity =
          this.quality.reducedMotion ? 0.22 - index * 0.06 : 0.0;
      });
      return;
    }

    if (this.lastRippleAt === 0) {
      this.lastRippleAt = t;
      this.ripples.forEach((ripple, index) => {
        ripple.startAt = t - index * 0.82;
      });
    }

    if (t - this.lastRippleAt >= TUNING.ripple.intervalMs / 1000) {
      const ripple = this.ripples[this.rippleCursor % this.ripples.length];
      ripple.startAt = t;
      this.rippleCursor += 1;
      this.lastRippleAt = t;
    }

    this.ripples.forEach((ripple) => {
      if (ripple.startAt === null) {
        ripple.mesh.visible = false;
        return;
      }
      const progress = (t - ripple.startAt) / (TUNING.ripple.durationMs / 1000);
      if (progress >= 1) {
        ripple.startAt = null;
        ripple.mesh.visible = false;
        return;
      }
      const p = Math.max(0, progress);
      ripple.mesh.visible = true;
      ripple.mesh.scale.setScalar(0.02 + TUNING.ripple.maxRadius * easeOutCubic(p));
      (ripple.mesh.material as THREE.MeshBasicMaterial).opacity =
        TUNING.ripple.opacity * Math.pow(1 - p, 1.5);
    });
  }

  private refreshSeoulLabel(): void {
    if (!this.seoulCanvas || !this.seoulTexture) return;
    drawSeoulLabel(this.seoulCanvas);
    this.seoulTexture.needsUpdate = true;
  }

  startMotion(): void {
    if (this.motionStarted) return;
    this.motionStarted = true;
    this.nextArcAt = this.time + 0.35;
    this.lastRippleAt = 0;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) {
      this.stopLoop();
    } else {
      this.startLoop();
    }
  }

  private startLoop(): void {
    if (this.disposed || this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  focusPin(id: string): void {
    const pin = ALL_PINS.find((item) => item.id === id);
    if (!pin) return;
    this.focusTarget = {
      yaw: (TUNING.view.lon - pin.lon) * DEG,
      pitch: Math.max(
        -TUNING.view.pitchLimit * DEG,
        Math.min(TUNING.view.pitchLimit * DEG, (pin.lat - TUNING.view.lat) * DEG),
      ),
    };
  }

  resetView(): void {
    this.focusTarget = { yaw: 0, pitch: 0 };
  }

  getSeoulScreen(): PinScreen | null {
    if (!this.seoulAnchor) return null;
    const world = this.seoulAnchor.getWorldPosition(new THREE.Vector3());
    const facing = world.clone().normalize().z;
    const ndc = world.clone().project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = (ndc.x * 0.5 + 0.5) * rect.width;
    const y = (-ndc.y * 0.5 + 0.5) * rect.height;
    const front = facing > TUNING.pins.frontThreshold;
    const visible = front && x > 8 && x < rect.width - 8 && y > 8 && y < rect.height - 8;
    return { id: 'seoul', x, y, front, visible };
  }

  getPinScreen(id: string): PinScreen | null {
    const pin = this.pins.find((item) => item.pin.id === id);
    if (!pin) return null;
    const world = pin.group.getWorldPosition(new THREE.Vector3());
    const facing = world.clone().normalize().z;
    const ndc = world.clone().project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = rect.left + (ndc.x * 0.5 + 0.5) * rect.width;
    const y = rect.top + (-ndc.y * 0.5 + 0.5) * rect.height;
    const front = facing > TUNING.pins.frontThreshold;
    const visible =
      front &&
      x > 8 &&
      x < window.innerWidth - 8 &&
      y > 8 &&
      y < window.innerHeight - 8;
    return { id, x, y, front, visible };
  }

  getAllPinScreens(): PinScreen[] {
    return this.pins.map((pin) => this.getPinScreen(pin.pin.id)).filter((item): item is PinScreen => item !== null);
  }

  dispose(): void {
    this.disposed = true;
    this.stopLoop();
    this.resizeObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointercancel', this.onPointerUp);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.disposables.forEach((item) => item.dispose());
    this.disposables = [];
    this.renderer.dispose();
    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
