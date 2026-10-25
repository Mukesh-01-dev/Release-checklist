import React from "react";
import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ReleaseList from "./components/ReleaseList";
import ReleaseForm from "./components/ReleaseForm";
import { useReleases } from "./hooks/useReleases";
import { useChecklist } from "./hooks/useChecklist";

export default function App() {
  const {
    releases, loading, error, refresh, createRelease, updateRelease,
    deleteRelease, saving,
  } = useReleases();
  const { saveToggle } = useChecklist(refresh);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const selectedRelease = useMemo(
    () => releases.find((release) => release.id === selectedId) || null,
    [releases, selectedId]
  );

  function goHome() {
    setSelectedId(null);
    setCreating(false);
  }

  useEffect(() => {
    const handler = () => goHome();
    window.addEventListener("releasecheck:home", handler);
    return () => window.removeEventListener("releasecheck:home", handler);
  }, []);

  async function handleSave(input) {
    if (creating) {
      const result = await createRelease({ variables: { input } });
      const created = result.data?.createRelease;
      await refresh();
      setSelectedId(created?.id || null);
      setCreating(false);
    } else if (selectedRelease) {
      await updateRelease({ variables: { id: selectedRelease.id, input } });
      await refresh();
    }
  }

  async function handleDelete(release) {
    if (!window.confirm(`Delete "${release.name}" and its checklist? This cannot be undone.`)) return;
    await deleteRelease({ variables: { id: release.id } });
    if (release.id === selectedId) goHome();
  }

  return (
    <div className="app-shell">
      <Header onHome={goHome} />
      {loading && releases.length === 0 ? (
        <main className="page"><div className="loading-state"><span className="spinner" />Loading releases…</div></main>
      ) : error ? (
        <main className="page"><div className="error-state"><h2>Could not load releases</h2><p>{error.message}</p><button className="button button-primary" onClick={() => refresh()}>Try again</button><p className="hint">Check that your backend is running and VITE_GRAPHQL_URL points to its GraphQL endpoint.</p></div></main>
      ) : creating ? (
        <ReleaseForm key="new" onSave={handleSave} onDelete={() => {}} onToggle={saveToggle} saving={saving} />
      ) : selectedRelease ? (
        <ReleaseForm key={selectedRelease.id} release={selectedRelease} onSave={handleSave} onDelete={handleDelete} onToggle={saveToggle} saving={saving} />
      ) : (
        <ReleaseList releases={releases} onOpen={(id) => { setSelectedId(id); setCreating(false); }} onCreate={() => { setCreating(true); setSelectedId(null); }} onDelete={handleDelete} />
      )}
      <footer className="footer">ReleaseCheck <span>·</span> Release readiness, made clear.</footer>
    </div>
  );
}