import { useEffect, useRef, useState } from 'react';
import { GREETING_CYCLE, getLanguageById, type Language } from '../config/languages';
import { TUNING } from '../config/tuning';

type Props = {
  hoveredLanguageId: string | null;
  started: boolean;
  reducedMotion: boolean;
};

const FIRST = GREETING_CYCLE[0];

export function GreetingTitle({ hoveredLanguageId, started, reducedMotion }: Props) {
  const [text, setText] = useState(FIRST.greeting);
  const [language, setLanguage] = useState<Language>(FIRST);
  const [override, setOverride] = useState<Language | null>(null);
  const indexRef = useRef(0);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (!hoveredLanguageId) {
      setOverride(null);
      return;
    }
    setOverride(getLanguageById(hoveredLanguageId) ?? null);
  }, [hoveredLanguageId]);

  useEffect(() => {
    if (!started) return;
    if (reducedMotion) {
      setText(FIRST.greeting);
      setLanguage(FIRST);
      return;
    }
    if (override) return;

    let cancelled = false;
    let index = indexRef.current;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const erase = async (word: string) => {
      for (let count = word.length; count >= 0; count -= 1) {
        if (cancelled) return;
        setText(word.slice(0, count));
        await sleep(TUNING.greeting.eraseMs);
      }
    };

    const type = async (word: string) => {
      for (let count = 1; count <= word.length; count += 1) {
        if (cancelled) return;
        setText(word.slice(0, count));
        await sleep(TUNING.greeting.typeMs);
      }
    };

    const run = async () => {
      if (firstRunRef.current) {
        firstRunRef.current = false;
        setText(FIRST.greeting);
        setLanguage(FIRST);
        await sleep(TUNING.greeting.holdMs);
        await erase(FIRST.greeting);
        index = 1 % GREETING_CYCLE.length;
        indexRef.current = index;
      }

      while (!cancelled) {
        const current = GREETING_CYCLE[index];
        setLanguage(current);
        await type(current.greeting);
        if (cancelled) return;
        await sleep(TUNING.greeting.holdMs);
        if (cancelled) return;
        await erase(current.greeting);
        if (cancelled) return;
        await sleep(TUNING.greeting.gapMs);
        index = (index + 1) % GREETING_CYCLE.length;
        indexRef.current = index;
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [started, reducedMotion, override]);

  const displayLanguage = override ?? language;
  const displayText = override ? override.greeting : text;
  const isOverride = Boolean(override);
  const greetingScale = displayText.length > 10 ? 0.76 : displayText.length > 7 ? 0.88 : 1;

  return (
    <div className="greeting-block">
      <div className={`greeting-block__label ${isOverride ? 'is-live' : ''}`}>
        <span className="greeting-block__code">{displayLanguage.code}</span>
        <span className="greeting-block__name">{displayLanguage.nameKo}</span>
        <span className="greeting-block__dot" aria-hidden="true" />
      </div>
      <h1 className="hero__title">
        <span className="line-mask">
          <span className="line-inner">
            <span
              className="greeting"
              aria-live="off"
              style={greetingScale !== 1 ? { fontSize: `${greetingScale}em` } : undefined}
            >
              {displayText}
            </span>
            <span className="greeting__cursor" aria-hidden="true" />
          </span>
        </span>
        <span className="line-mask line-mask--fixed">
          <span className="line-inner hero__title-fixed">
            AI와 말하고,
            <br />
            <em>바로 교정받기</em>
          </span>
        </span>
      </h1>
    </div>
  );
}
