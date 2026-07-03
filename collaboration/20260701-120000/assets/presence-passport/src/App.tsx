import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Rectangle, useMapEvents, useMap } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import {
  USE_CASES,
  checkBackendHealth,
  exportBundle,
  fetchTemplates,
  friendlyStepLabel,
  launchPathway,
  type Template,
  type PathwayRun,
} from "./api";

type WizardStep = "welcome" | "choose" | "mark" | "create" | "done";

const DEFAULT_BOUNDS = L.latLngBounds([40.75, -73.99], [40.82, -73.95]);

function DrawRegion({ onBounds }: { onBounds: (b: LatLngBounds) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const pad = 0.025;
      onBounds(L.latLngBounds([lat - pad, lng - pad], [lat + pad, lng + pad]));
    },
  });
  return null;
}

function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);
  return null;
}

function boundsToGeoJSON(bounds: LatLngBounds) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return {
    type: "Polygon" as const,
    coordinates: [
      [
        [sw.lng, sw.lat],
        [ne.lng, sw.lat],
        [ne.lng, ne.lat],
        [sw.lng, ne.lat],
        [sw.lng, sw.lat],
      ],
    ],
  };
}

function spokenWordsFromRun(run: PathwayRun): string | null {
  for (const art of Object.values(run.step_artifacts || {})) {
    if (art && typeof art === "object" && "spoken_seal_24w" in art) {
      return String((art as { spoken_seal_24w: string }).spoken_seal_24w);
    }
  }
  return null;
}

export default function App() {
  const [step, setStep] = useState<WizardStep>("welcome");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useCaseId, setUseCaseId] = useState<string>("survey");
  const [selected, setSelected] = useState<Template | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds>(DEFAULT_BOUNDS);
  const [run, setRun] = useState<PathwayRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const refreshBackend = useCallback(async () => {
    const ok = await checkBackendHealth();
    setBackendOk(ok);
    return ok;
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoadError(null);
    try {
      const ok = await refreshBackend();
      if (!ok) {
        setLoadError("We can't reach the server yet. Start the backend (see instructions below) and tap Try again.");
        setTemplates([]);
        return;
      }
      const list: Template[] = await fetchTemplates();
      setTemplates(list.filter((t) => t.identity.includes("Presence.")));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load workflows");
    }
  }, [refreshBackend]);

  useEffect(() => {
    if (step !== "welcome") loadTemplates();
  }, [step, loadTemplates]);

  const pickTemplateForUseCase = useCallback(
    (caseId: string) => {
      const uc = USE_CASES.find((c) => c.id === caseId);
      if (!uc) return null;
      return templates.find((t) => t.identity.includes(uc.templateMatch)) || null;
    },
    [templates]
  );

  useEffect(() => {
    if (templates.length && useCaseId) {
      setSelected(pickTemplateForUseCase(useCaseId));
    }
  }, [templates, useCaseId, pickTemplateForUseCase]);

  const createPassport = useCallback(async () => {
    if (!selected) {
      setActionError("Please choose what kind of proof you need first.");
      return;
    }
    setLoading(true);
    setActionError(null);
    setRun(null);
    try {
      const ok = await refreshBackend();
      if (!ok) {
        setActionError("The server isn't running. Start it in your terminal, then try again.");
        return;
      }
      const data = await launchPathway(selected.id, {
        polygon_geojson: boundsToGeoJSON(bounds),
        depth: 7,
        time_us: Date.now() * 1000,
        k_min: 3,
      });
      if (data.status === "FAILED") {
        setActionError(data.error_message || "Something went wrong creating your passport.");
        return;
      }
      setRun(data);
      setStep("done");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not create your presence passport");
    } finally {
      setLoading(false);
    }
  }, [selected, bounds, refreshBackend]);

  const handleDownload = useCallback(async () => {
    if (!run) return;
    setActionError(null);
    try {
      const blob = await exportBundle(run.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presence-passport-${run.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Download failed");
    }
  }, [run]);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setActionError("Your browser doesn't support location. Tap the map instead.");
      return;
    }
    setActionError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const pad = 0.02;
        setBounds(L.latLngBounds([lat - pad, lng - pad], [lat + pad, lng + pad]));
      },
      () => setActionError("Couldn't get your location. Tap the map to mark your area instead.")
    );
  }, []);

  const spoken = run ? spokenWordsFromRun(run) : null;

  return (
    <div className="app">
      {step === "welcome" && (
        <section className="hero">
          <div className="hero-badge">Field proof, made simple</div>
          <h1>Presence Passport</h1>
          <p className="hero-lead">
            Create a <strong>verifiable record</strong> that you (or your team) were in a place at a time —
            without needing a blockchain, a lawyer, or a tech manual.
          </p>
          <ul className="hero-benefits">
            <li>
              <span className="benefit-icon">✓</span>
              <span>
                <strong>Mark your area</strong> on a map — we turn it into a fair, equal-area fingerprint anyone can
                check.
              </span>
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              <span>
                <strong>Get a presence seal</strong> — a tamper-evident proof you can save, email, or read aloud
                (even offline).
              </span>
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              <span>
                <strong>Share with confidence</strong> — others can verify your proof without trusting our servers.
              </span>
            </li>
          </ul>
          <p className="hero-note">
            Ideal for conservation surveys, property inspections, citizen science, and any work where{" "}
            <em>“were you really there?”</em> matters.
          </p>
          <button type="button" className="primary primary-lg" onClick={() => setStep("choose")}>
            Create my presence passport →
          </button>
          <p className="fine-print">
            This proves <strong>consistency</strong> of your record, not that the world matches your claim. Takes about
            30 seconds.
          </p>
        </section>
      )}

      {step !== "welcome" && (
        <>
          <header className="wizard-header">
            <button
              type="button"
              className="link-back"
              onClick={() => {
                if (step === "done") setStep("create");
                else if (step === "create") setStep("mark");
                else if (step === "mark") setStep("choose");
                else setStep("welcome");
              }}
            >
              ← Back
            </button>
            <div className="step-indicator">
              {(["choose", "mark", "create", "done"] as const).map((s, i) => (
                <span key={s} className={`step-dot ${step === s ? "active" : ""} ${["choose", "mark", "create", "done"].indexOf(step) > i ? "done" : ""}`} />
              ))}
            </div>
            <span className={`backend-pill ${backendOk === true ? "ok" : backendOk === false ? "bad" : ""}`}>
              {backendOk === null ? "Checking…" : backendOk ? "Ready" : "Server offline"}
            </span>
          </header>

          {(loadError || actionError) && (
            <div className="error-banner" role="alert">
              <strong>Something needs your attention</strong>
              <p>{actionError || loadError}</p>
              {backendOk === false && (
                <details className="help-details">
                  <summary>How to start the server</summary>
                  <pre>{`cd backend\nuv sync\nuv run uvicorn app.main:app --reload --port 8000`}</pre>
                  <p>Then in another terminal: <code>cd presence-passport && npm run dev</code></p>
                </details>
              )}
              <button type="button" className="secondary" onClick={() => { setActionError(null); loadTemplates(); }}>
                Try again
              </button>
            </div>
          )}

          {step === "choose" && (
            <section className="wizard-panel">
              <h2>What are you proving?</h2>
              <p className="panel-intro">Pick the story that fits your work. We'll handle the cryptography.</p>
              <div className="use-case-grid">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc.id}
                    type="button"
                    className={`use-case-card ${useCaseId === uc.id ? "selected" : ""}`}
                    onClick={() => setUseCaseId(uc.id)}
                  >
                    <span className="use-case-icon">{uc.icon}</span>
                    <span className="use-case-title">{uc.title}</span>
                    <span className="use-case-sub">{uc.subtitle}</span>
                    <span className="use-case-example">{uc.example}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="primary primary-lg"
                disabled={!selected && templates.length === 0}
                onClick={() => setStep("mark")}
              >
                Next: mark your area →
              </button>
            </section>
          )}

          {step === "mark" && (
            <section className="wizard-panel">
              <h2>Where were you working?</h2>
              <p className="panel-intro">
                Tap the map to set the area you want to prove. The blue box is your survey zone — drag isn't needed,
                just tap near the center of your site.
              </p>
              <div className="map-actions">
                <button type="button" className="secondary" onClick={useMyLocation}>
                  Use my current location
                </button>
              </div>
              <div className="map-wrap map-wrap-lg">
                <MapContainer center={[40.78, -73.97]} zoom={10} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  <Rectangle bounds={bounds} pathOptions={{ color: "#4a9eff", weight: 2, fillOpacity: 0.25 }} />
                  <DrawRegion onBounds={setBounds} />
                  <FitBounds bounds={bounds} />
                </MapContainer>
              </div>
              <button type="button" className="primary primary-lg" onClick={() => setStep("create")}>
                Next: create my passport →
              </button>
            </section>
          )}

          {step === "create" && (
            <section className="wizard-panel">
              <h2>Ready to create your passport</h2>
              <p className="panel-intro">
                We'll map your area, seal it with a tamper-proof fingerprint, and build a proof package you can
                download and share.
              </p>
              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-label">Type</span>
                  <span>{USE_CASES.find((c) => c.id === useCaseId)?.title || "Field proof"}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Area</span>
                  <span>Custom region on map</span>
                </div>
              </div>
              <button
                type="button"
                className="primary primary-lg"
                disabled={loading || !selected}
                onClick={createPassport}
              >
                {loading ? (
                  <span className="loading-row">
                    <span className="spinner" aria-hidden /> Creating your presence passport…
                  </span>
                ) : (
                  "Create my presence passport"
                )}
              </button>
              {!selected && templates.length > 0 && (
                <p className="hint">Loading workflow… if this persists, go back and pick a proof type.</p>
              )}
            </section>
          )}

          {step === "done" && run && (
            <section className="wizard-panel">
              <div className="success-banner">
                <span className="success-icon">✓</span>
                <div>
                  <h2>Your presence passport is ready</h2>
                  <p>Anyone with this file can verify your proof offline — no account required.</p>
                </div>
              </div>

              <div className="passport-card">
                <div className="passport-header">
                  <span className="passport-label">PRESENCE PASSPORT</span>
                  <span className={`passport-status status-${run.status.toLowerCase()}`}>{run.status === "COMPLETED" ? "Verified record" : run.status}</span>
                </div>
                <p className="passport-type">{USE_CASES.find((c) => c.id === useCaseId)?.title}</p>
                {spoken && (
                  <div className="spoken-seal">
                    <span className="summary-label">Speakable backup (24 words)</span>
                    <p className="spoken-words">{spoken}</p>
                    <p className="fine-print">You can read these over the phone if digital files aren't available.</p>
                  </div>
                )}
                <ol className="steps-plain">
                  {run.step_executions.map((s) => (
                    <li key={s.order} className={s.status === "COMPLETED" ? "done" : ""}>
                      {friendlyStepLabel(s.agent_id)}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="action-row">
                <button type="button" className="primary primary-lg" onClick={handleDownload}>
                  Download proof package
                </button>
                <button type="button" className="secondary" onClick={() => { setRun(null); setStep("choose"); }}>
                  Create another
                </button>
              </div>

              <button type="button" className="link-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? "Hide" : "Show"} technical details
              </button>
              {showAdvanced && (
                <div className="advanced-panel">
                  <p><code>{run.template_identity}</code></p>
                  {run.aqua_stub_id && <p>Orchestration ref: <code>{run.aqua_stub_id}</code></p>}
                  <p>Run ID: <code>{run.id}</code></p>
                  <p className="fine-print">Burin kernel: PolyForm NC. Pathway license applies to the workflow recipe only.</p>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
