import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ReleaseList({ releases, onOpen, onCreate, onDelete }) {
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Release checklists</h1>
          <p className="subheading">Track every release from planning to production.</p>
        </div>
        <button className="button button-primary" onClick={onCreate}>＋ New release</button>
      </div>

      {releases.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon">✓</div>
          <h2>No releases yet</h2>
          <p>Create your first release and track its checklist here.</p>
          <button className="button button-primary" onClick={onCreate}>Create a release</button>
        </section>
      ) : (
        <section className="panel">
          <div className="panel-header">
            <div><h2>All releases</h2><p>{releases.length} release{releases.length === 1 ? "" : "s"}</p></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Release</th><th>Due date</th><th>Status</th><th>Checklist progress</th><th>Actions</th></tr></thead>
              <tbody>
                {releases.map((release) => (
                  <tr key={release.id}>
                    <td><button className="release-name" onClick={() => onOpen(release.id)}>{release.name}</button><span className="release-id">Release checklist</span></td>
                    <td className="date-cell">{formatDate(release.dueDate)}</td>
                    <td><StatusBadge status={release.status} /></td>
                    <td className="progress-cell"><ProgressBar completed={release.completedSteps} total={release.totalSteps} /></td>
                    <td><div className="row-actions"><button className="text-button" onClick={() => onOpen(release.id)}>View</button><button className="text-button danger-text" onClick={() => onDelete(release)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}