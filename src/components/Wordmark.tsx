type Props = {
  compact?: boolean;
};

export function Wordmark({ compact = false }: Props) {
  return (
    <span className="wordmark" aria-label="HUFS Echo">
      <svg className="wordmark__mark" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="5" cy="16" r="2.6" fill="currentColor" />
        <path
          d="M11 9.4a8.2 8.2 0 0 1 0 13.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M16 5.6a13.4 13.4 0 0 1 0 20.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M21 2.2a18.2 18.2 0 0 1 0 27.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.26"
        />
      </svg>
      <span className="wordmark__text">
        HUFS <b>ECHO</b>
      </span>
      {!compact && <span className="wordmark__beta">BETA</span>}
    </span>
  );
}
