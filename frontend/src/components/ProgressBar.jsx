export default function ProgressBar({ completed = 0, total = 10 }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress-wrap" aria-label={`${percent}% complete`}>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      <span className="progress-label">{completed}/{total}</span>
    </div>
  );
}