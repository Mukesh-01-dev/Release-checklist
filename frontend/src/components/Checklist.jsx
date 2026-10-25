import { useEffect, useState } from "react";

export default function Checklist({ release, onToggle }) {
  const [steps, setSteps] = useState(release.steps || []);
  const [error, setError] = useState("");

  useEffect(() => {
    setSteps(release.steps || []);
  }, [release.id, release.steps]);

  async function handleChange(step) {
    const nextCompleted = !step.completed;
    setError("");
    // Optimistic UI: tick/untick immediately without waiting for the API.
    setSteps((current) => current.map((item) =>
      item.stepId === step.stepId ? { ...item, completed: nextCompleted } : item
    ));
    try {
      await onToggle(release.id, step.stepId);
    } catch {
      setError("A step could not be saved. The checklist has been refreshed.");
    }
  }

  return (
    <section className="panel checklist-panel">
      <div className="panel-header checklist-heading">
        <div><h2>Release checklist</h2><p>Complete each step as the release progresses.</p></div>
        <span className="step-count">{steps.filter((s) => s.completed).length} of {steps.length}</span>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <div className="checklist">
        {steps.map((step, index) => (
          <label className={`checklist-item ${step.completed ? "is-complete" : ""}`} key={step.stepId}>
            <input type="checkbox" checked={Boolean(step.completed)} onChange={() => handleChange(step)} />
            <span className="custom-check" aria-hidden="true">{step.completed ? "✓" : ""}</span>
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="step-title">{step.title}</span>
            <span className="step-state">{step.completed ? "Completed" : "Pending"}</span>
          </label>
        ))}
      </div>
    </section>
  );
}