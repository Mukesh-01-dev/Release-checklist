const LABELS = { planned: "Planned", ongoing: "Ongoing", done: "Done" };

export default function StatusBadge({ status = "planned" }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status] || status}</span>;
}