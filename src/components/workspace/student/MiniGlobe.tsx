export function MiniGlobe() {
  return (
    <div className="mini-globe" aria-hidden="true">
      <span className="mini-globe__halo" />
      <img className="mini-globe__img" src="/fallback-globe.png" alt="" draggable={false} />
      <svg className="mini-globe__arc" viewBox="0 0 260 260">
        <path
          d="M57 92 C 98 48, 170 48, 208 88"
          fill="none"
          stroke="rgba(168, 218, 255, 0.78)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <circle cx="57" cy="92" r="3.2" fill="#D8ECFF" />
        <circle cx="208" cy="88" r="3.2" fill="#D8ECFF" />
        <circle cx="208" cy="88" r="7" fill="none" stroke="rgba(168, 218, 255, 0.4)" strokeWidth="1" />
      </svg>
      <span className="mini-globe__label mini-globe__label--seoul">SEOUL</span>
      <span className="mini-globe__label mini-globe__label--lisboa">LISBOA</span>
      <span className="mini-globe__badge">A1</span>
    </div>
  );
}
