import { useEffect, useState } from "react";
import Checklist from "./Checklist";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ReleaseForm({ release, onSave, onDelete, onToggle, saving }) {
  const isNew = !release;
  const [name, setName] = useState(release?.name || "");
  const [dueDate, setDueDate] = useState(toLocalInput(release?.dueDate));
  const [additionalInfo, setAdditionalInfo] = useState(release?.additionalInfo || "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setName(release?.name || "");
    setDueDate(toLocalInput(release?.dueDate));
    setAdditionalInfo(release?.additionalInfo || "");
    setFormError("");
  }, [release?.id]);

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    if (!name.trim()) return setFormError("Enter a release name.");
    if (!dueDate) return setFormError("Choose a due date and time.");
    try {
      await onSave({ name: name.trim(), dueDate: new Date(dueDate).toISOString(), additionalInfo: additionalInfo.trim() || null });
    } catch (error) {
      setFormError(error.message || "Could not save this release.");
    }
  }

  return (
    <main className="page">
      <div className="breadcrumbs"><button onClick={() => window.dispatchEvent(new Event("releasecheck:home"))}>Releases</button><span>/</span><span>{isNew ? "New release" : release.name}</span></div>
      <div className="page-heading detail-heading">
        <div><p className="eyebrow">{isNew ? "CREATE" : "RELEASE DETAILS"}</p><h1>{isNew ? "Create a release" : release.name}</h1><p className="subheading">{isNew ? "Set a release date and prepare your checklist." : "Manage release information and track completion."}</p></div>
        {!isNew && <StatusBadge status={release.status} />}
      </div>

      <form onSubmit={submit} className="release-layout">
        <div className="form-column">
          <section className="panel form-panel">
            <div className="panel-header"><div><h2>Release information</h2><p>Basic details for this release.</p></div></div>
            <div className="form-fields">
              <label className="field"><span>Release name <b>*</b></span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Version 2.4.0" maxLength={255} required /></label>
              <label className="field"><span>Release date and time <b>*</b></span><input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></label>
              <label className="field"><span>Additional information <small>Optional</small></span><textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Add notes, risks, or release details…" rows={4} /></label>
            </div>
            {formError && <p className="inline-error" role="alert">{formError}</p>}
            <div className="form-actions">
              <button type="button" className="button button-secondary" onClick={() => window.dispatchEvent(new Event("releasecheck:home"))}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Create release" : "Save changes"}</button>
            </div>
          </section>
          {!isNew && <Checklist release={release} onToggle={onToggle} />}
        </div>
        {!isNew && <aside className="side-column"><section className="panel summary-panel"><p className="eyebrow">COMPLETION</p><div className="summary-number">{Math.round((release.completedSteps / (release.totalSteps || 10)) * 100)}<span>%</span></div><ProgressBar completed={release.completedSteps} total={release.totalSteps} /><p className="summary-copy">{release.completedSteps} of {release.totalSteps} checklist steps completed.</p><div className="summary-divider" /><div className="summary-row"><span>Status</span><StatusBadge status={release.status} /></div><div className="summary-row"><span>Checklist items</span><strong>{release.totalSteps}</strong></div></section><button type="button" className="button button-danger-outline full-width" onClick={() => onDelete(release)}>Delete release</button></aside>}
      </form>
    </main>
  );
}