import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getPinById } from '../config/languages';
import type { Quality } from '../config/tuning';
import { GlobeScene } from '../globe/GlobeScene';
import { placeTooltip } from '../lib/placeTooltip';
import { LanguageTooltip } from './LanguageTooltip';

export type GlobeStageHandle = {
  focusPin: (id: string) => void;
  resetView: () => void;
};

type Props = {
  quality: Quality;
  activePinId: string | null;
  started: boolean;
  paused?: boolean;
  onHoverPin: (id: string | null) => void;
  onSelectPin: (id: string) => void;
  onReady?: () => void;
};

export const GlobeStage = forwardRef<GlobeStageHandle, Props>(function GlobeStage(
  { quality, activePinId, started, paused = false, onHoverPin, onSelectPin, onReady },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const seoulOverlayRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GlobeScene | null>(null);
  const callbacksRef = useRef({ onHoverPin, onSelectPin, onReady });
  const [ready, setReady] = useState(false);
  callbacksRef.current = { onHoverPin, onSelectPin, onReady };

  useEffect(() => {
    if (!quality.webgl) {
      callbacksRef.current.onReady?.();
      setReady(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const scene = new GlobeScene(container, quality, {
      onReady: () => {
        setReady(true);
        callbacksRef.current.onReady?.();
      },
      onHoverChange: (id) => callbacksRef.current.onHoverPin(id),
      onSelectPin: (id) => callbacksRef.current.onSelectPin(id),
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [quality]);

  useEffect(() => {
    if (!quality.webgl) return;
    const element = seoulOverlayRef.current;
    if (!element) return;

    let raf = 0;
    const tick = () => {
      const screen = sceneRef.current?.getSeoulScreen();
      if (screen) {
        element.style.transform = `translate3d(${screen.x}px, ${screen.y}px, 0)`;
        element.style.opacity = screen.visible ? '1' : '0';
      } else {
        element.style.opacity = '0';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [quality]);

  useEffect(() => {
    sceneRef.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (started) sceneRef.current?.startMotion();
  }, [started]);

  useEffect(() => {
    if (!activePinId) return;
    const element = tooltipRef.current;
    const scene = sceneRef.current;
    if (!element || !scene) return;

    element.style.opacity = '0';
    let raf = 0;
    let frames = 0;

    const tick = () => {
      const currentScene = sceneRef.current;
      if (currentScene) {
        const screen = currentScene.getPinScreen(activePinId);
        if (!screen || !screen.visible) {
          element.style.opacity = '0';
        } else {
          placeTooltip(element, screen, currentScene.getAllPinScreens());
          element.style.opacity = '1';
        }
      }
      frames += 1;
      // 첫 프레임에서 크기 측정이 끝난 뒤에도 계속 부드럽게 따라갑니다.
      if (frames < 600) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activePinId]);

  useImperativeHandle(
    ref,
    () => ({
      focusPin: (id: string) => sceneRef.current?.focusPin(id),
      resetView: () => sceneRef.current?.resetView(),
    }),
    [],
  );

  const activePin = activePinId ? getPinById(activePinId) : null;

  return (
    <div className="globe-stage" ref={containerRef} data-ready={ready}>
      {!quality.webgl && (
        <img
          className="globe-fallback"
          src="/fallback-globe.png"
          alt="서울에서 세계로 뻗어 나가는 빛을 표현한 도트 지구본"
          draggable={false}
        />
      )}
      <img
        className="globe-owl-logo"
        src="/owls/hufs-owl-light.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div
        className={`seoul-overlay ${quality.webgl ? 'seoul-overlay--webgl' : 'seoul-overlay--fallback'}`}
        ref={seoulOverlayRef}
        aria-hidden="true"
      >
        <span className="seoul-overlay__pin" />
        <span className="seoul-overlay__label">S E O U L</span>
      </div>
      {quality.webgl && activePin && (
        <div className="lang-tip-wrap" ref={tooltipRef} data-side="right">
          <LanguageTooltip pin={activePin} />
        </div>
      )}
    </div>
  );
});
