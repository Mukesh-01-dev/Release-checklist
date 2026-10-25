export default function Header({ onHome }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} aria-label="Go to releases">
        <span className="brand-mark">R</span>
        <span>Release<span className="brand-light">Check</span></span>
      </button>
      <span className="topbar-label">RELEASE MANAGEMENT</span>
    </header>
  );
}