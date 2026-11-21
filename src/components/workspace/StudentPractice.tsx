import { useEffect, useRef, useState } from 'react';
import {
  ERROR_TAGS,
  INITIAL_MESSAGES,
  SUGGESTIONS,
  UNITS,
  WEAKNESSES,
  mockReply,
  type ChatMessage,
  type Correction,
} from '../../config/demo';

type Props = {
  onToast: (message: string) => void;
};

let sequence = 0;
const nextId = () => `m${Date.now()}-${sequence++}`;

export function StudentPractice({ onToast }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ top: element.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, typing]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const turn = messages.filter((message) => message.role === 'user').length + 1;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', pt: trimmed }]);
    setInput('');
    setTyping(true);
    timerRef.current = window.setTimeout(() => {
      const reply = mockReply(trimmed, turn);
      setMessages((prev) => [...prev, { id: nextId(), role: 'ai', ...reply }]);
      setTyping(false);
    }, 900);
  }

  return (
    <div className="practice">
      <aside className="practice__rail">
        <p className="side-label">COURSE</p>
        <div className="rail-course">
          <b>포르투갈어 A1</b>
          <span>기초 회화 · 12주</span>
        </div>
        <ol className="units">
          {UNITS.map((unit) => (
            <li key={unit.id} className={`unit unit--${unit.status}`}>
              <span className="unit__week">{unit.week}</span>
              <span className="unit__title">{unit.title}</span>
              <span className="unit__sub">{unit.subtitle}</span>
              <span className="unit__bar" aria-hidden="true">
                <i style={{ width: `${unit.progress}%` }} />
              </span>
            </li>
          ))}
        </ol>
        <div className="rail-goal">
          <div className="rail-goal__top">
            <span>이번 주 목표</span>
            <b>3 / 4</b>
          </div>
          <p>연습 4회 중 3회 완료</p>
          <div className="rail-goal__dots" aria-hidden="true">
            <i className="is-done" />
            <i className="is-done" />
            <i className="is-done" />
            <i />
          </div>
        </div>
      </aside>

      <main className="practice__main">
        <header className="practice__head">
          <div>
            <p className="practice__eyebrow">PORTUGUÊS · A1 · 3주차</p>
            <h1>카페에서 주문하기</h1>
          </div>
          <div className="practice__meta">
            <span>12개 표현</span>
            <span>약 10분</span>
            <span className="is-live">진행 중</span>
          </div>
        </header>

        <div className="scenario">
          <span className="scenario__avatar">
            <img src="/owls/suitcase.png" alt="" draggable={false} />
          </span>
          <div className="scenario__who">
            <b>이사벨라</b>
            <p>리스본의 작은 카페 · 오전 10시</p>
          </div>
          <p className="scenario__line">“Bom dia! O que deseja?”</p>
        </div>

        <div className="chat" ref={scrollRef}>
          <div className="chat__date">오늘 · 3주차 연습</div>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {typing && (
            <div className="chat__typing" aria-label="이사벨라가 입력 중">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="composer">
          <div className="composer__suggestions">
            <span>이렇게 말해보세요</span>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={typing}>
                {suggestion}
              </button>
            ))}
          </div>
          <form
            className="composer__box"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              placeholder="포르투갈어로 입력하거나 말해보세요"
              rows={2}
              aria-label="포르투갈어 입력"
            />
            <div className="composer__actions">
              <button
                type="button"
                className="composer__mic"
                onClick={() => onToast('음성 입력은 데모에서 제공하지 않아요.')}
                aria-label="음성 입력"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="7.2" y="2.6" width="5.6" height="9" rx="2.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.8 9.4a5.2 5.2 0 0 0 10.4 0M10 14.6v3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
              <span className="composer__hint">Enter 전송 · Shift+Enter 줄바꿈</span>
              <button
                type="submit"
                className="composer__send"
                disabled={!input.trim() || typing}
                aria-label="전송"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3.5 10h12M10.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>

      <aside className="practice__side">
        <div className="side-card">
          <p className="side-label">이번 세션 교정</p>
          <div className="tags">
            {ERROR_TAGS.map((tag) => (
              <span key={tag.tag}>
                {tag.tag} <b>{tag.count}</b>
              </span>
            ))}
          </div>
          <p className="side-card__note">오늘 18개의 교정이 쌓였어요.</p>
        </div>

        <div className="side-card">
          <p className="side-label">반 전체 취약점</p>
          {WEAKNESSES.slice(0, 3).map((weakness) => (
            <div className="mini-bar" key={weakness.label}>
              <div>
                <span>{weakness.label}</span>
                <b>{weakness.percent}%</b>
              </div>
              <i>
                <em style={{ width: `${weakness.percent}%` }} />
              </i>
            </div>
          ))}
        </div>

        <div className="side-tip">
          <span>TIP</span>
          <p>“por favor”를 문장 끝에 붙이면 훨씬 공손하게 들려요.</p>
        </div>
      </aside>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="msg msg--user">
        <div className="msg__bubble">
          <p className="msg__pt">{message.pt}</p>
        </div>
        <span className="msg__who">나</span>
      </div>
    );
  }

  return (
    <div className="msg msg--ai">
      <span className="msg__avatar">
        <img src="/owls/football.png" alt="" draggable={false} />
      </span>
      <div className="msg__body">
        <div className="msg__bubble">
          <p className="msg__pt">{message.pt}</p>
          {message.ko && <p className="msg__ko">{message.ko}</p>}
        </div>
        {message.correction && <CorrectionCard correction={message.correction} />}
        <span className="msg__who">이사벨라 · AI 튜터</span>
      </div>
    </div>
  );
}

function CorrectionCard({ correction }: { correction: Correction }) {
  return (
    <div className="correction">
      <div className="correction__head">
        <span className="correction__tag">{correction.tag}</span>
        <span>즉시 교정</span>
      </div>
      <p className="correction__line">
        <span className="correction__bad">{correction.original}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
      <p className="correction__line correction__line--good">
        <span className="correction__good">{correction.corrected}</span>
      </p>
      <p className="correction__note">{correction.explanation}</p>
    </div>
  );
}
