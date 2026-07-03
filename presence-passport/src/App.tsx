import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Rectangle, useMapEvents, useMap } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import {
  HERO_VIGNETTES,
  PERSONAS,
  checkBackendHealth,
  exportBundle,
  fetchTemplates,
  friendlyStepLabel,
  getPersona,
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
  const [personaId, setPersonaId] = useState<string>("maria");
  const [selected, setSelected] = useState<Template | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds>(DEFAULT_BOUNDS);
  const [run, setRun] = useState<PathwayRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activePersona = getPersona(personaId);

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

  const pickTemplateForPersona = useCallback(
    (id: string) => {
      const persona = PERSONAS.find((p) => p.id === id);
      if (!persona) return null;
      return templates.find((t) => t.identity.includes(persona.templateMatch)) || null;
    },
    [templates]
  );

  useEffect(() => {
    if (templates.length && personaId) {
      setSelected(pickTemplateForPersona(personaId));
    }
  }, [templates, personaId, pickTemplateForPersona]);

  const createProof = useCallback(async () => {
    if (!selected) {
      setActionError("Go back and pick the person whose situation sounds like yours.");
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
        setActionError(data.error_message || "Something went wrong. Try a slightly larger area on the map.");
        return;
      }
      setRun(data);
      setStep("done");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not create your proof");
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
      a.download = `field-proof-${new Date().toISOString().slice(0, 10)}.json`;
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
      () => setActionError("Couldn't get your location. Tap the map at your site instead.")
    );
  }, []);

  const spoken = run ? spokenWordsFromRun(run) : null;

  return (
    <div className="app">
      {step === "welcome" && (
        <section className="hero">
          <p className="hero-eyebrow">For people who work on site — and get second-guessed</p>
          <h1>Reply with proof, not just your word.</h1>
          <p className="hero-lead">
            When payroll, a grant officer, or a contractor&apos;s lawyer pushes back, attach a small file
            they can verify themselves — tied to <strong>where and when</strong>, without handing over
            your full GPS trail.
          </p>

          <div className="vignette-stack">
            {HERO_VIGNETTES.map((v) => (
              <blockquote key={v.who} className="vignette">
                <p className="vignette-quote">&ldquo;{v.quote}&rdquo;</p>
                <footer>
                  <span className="vignette-who">{v.who}</span>
                  <span className="vignette-role">{v.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <button type="button" className="primary primary-lg" onClick={() => setStep("choose")}>
            Reply with proof →
          </button>
          <p className="fine-print center">
            About a minute · No signup · Free demo (Burin + Pathways)
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
                <span
                  key={s}
                  className={`step-dot ${step === s ? "active" : ""} ${["choose", "mark", "create", "done"].indexOf(step) > i ? "done" : ""}`}
                />
              ))}
            </div>
            <span className={`backend-pill ${backendOk === true ? "ok" : backendOk === false ? "bad" : ""}`}>
              {backendOk === null ? "…" : backendOk ? "Ready" : "Offline"}
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
                </details>
              )}
              <button type="button" className="secondary" onClick={() => { setActionError(null); loadTemplates(); }}>
                Try again
              </button>
            </div>
          )}

          {step === "choose" && (
            <section className="wizard-panel">
              <h2>Who are you replying to?</h2>
              <p className="panel-intro">
                Pick the person closest to you. We&apos;ll tailor the map question and the file you send back.
              </p>
              <div className="persona-grid">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`persona-card ${personaId === p.id ? "selected" : ""}`}
                    onClick={() => setPersonaId(p.id)}
                  >
                    <div className="persona-head">
                      <span className="persona-icon">{p.icon}</span>
                      <div>
                        <span className="persona-name">{p.name}</span>
                        <span className="persona-role">{p.role}</span>
                      </div>
                    </div>
                    <p className="persona-trigger">{p.trigger}</p>
                    <p className="persona-situation">{p.situation}</p>
                    <div className="persona-compare">
                      <div className="persona-without">
                        <span className="persona-compare-label">Without this</span>
                        <p>{p.withoutThis}</p>
                      </div>
                      <div className="persona-with">
                        <span className="persona-compare-label">You send</span>
                        <p>{p.withThis}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="primary primary-lg"
                disabled={!selected && templates.length === 0}
                onClick={() => setStep("mark")}
              >
                Continue →
              </button>
            </section>
          )}

          {step === "mark" && activePersona && (
            <section className="wizard-panel">
              <p className="persona-context">
                {activePersona.name} · {activePersona.role.split(" · ")[0]}
              </p>
              <h2>{activePersona.mapTitle}</h2>
              <p className="panel-intro">{activePersona.mapIntro}</p>
              <div className="map-actions">
                <button type="button" className="secondary" onClick={useMyLocation}>
                  I&apos;m on site now — use my location
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
              <p className="map-hint">Blue box = the area your proof will cover. Tap elsewhere to move it.</p>
              <button type="button" className="primary primary-lg" onClick={() => setStep("create")}>
                That&apos;s the right area →
              </button>
            </section>
          )}

          {step === "create" && activePersona && (
            <section className="wizard-panel">
              <h2>Build {activePersona.name.split(" ")[0]}&apos;s proof file</h2>
              <p className="panel-intro">
                This becomes the attachment for the message you&apos;re replying to — something they can
                verify without calling you.
              </p>
              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-label">Replying to</span>
                  <span className="summary-value">{activePersona.trigger.split(":")[0]}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">You send</span>
                  <span className="summary-value">{activePersona.withThis}</span>
                </div>
              </div>
              <button
                type="button"
                className="primary primary-lg"
                disabled={loading || !selected}
                onClick={createProof}
              >
                {loading ? (
                  <span className="loading-row">
                    <span className="spinner" aria-hidden /> Building your proof…
                  </span>
                ) : (
                  "Generate proof file"
                )}
              </button>
            </section>
          )}

          {step === "done" && run && activePersona && (
            <section className="wizard-panel">
              <div className="success-banner">
                <span className="success-icon">✓</span>
                <div>
                  <h2>Attach this to your reply</h2>
                  <p>
                    Download and send it to {activePersona.trigger.split(":")[0].toLowerCase()}. They can
                    verify without an account — or you read the 24 words over the phone if signal is bad.
                  </p>
                </div>
              </div>

              <div className="passport-card">
                <div className="passport-header">
                  <span className="passport-label">FIELD PROOF</span>
                  <span className="passport-status">{run.status === "COMPLETED" ? "Ready to send" : run.status}</span>
                </div>
                <p className="passport-situation">{activePersona.trigger}</p>
                <div className="share-steps">
                  <p className="summary-label">What to do next</p>
                  <ol>
                    <li>Download the proof file below</li>
                    <li>Attach it to your message (email, ticket, report)</li>
                    <li>They open it — verification works even offline</li>
                  </ol>
                </div>
                {spoken && (
                  <div className="spoken-seal">
                    <span className="summary-label">No signal? Read these 24 words over the phone</span>
                    <p className="spoken-words">{spoken}</p>
                  </div>
                )}
              </div>

              <div className="action-row">
                <button type="button" className="primary primary-lg" onClick={handleDownload}>
                  Download proof to send
                </button>
                <button type="button" className="secondary" onClick={() => { setRun(null); setStep("choose"); }}>
                  Create another
                </button>
              </div>

              <button type="button" className="link-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? "Hide" : "Show"} how this works under the hood
              </button>
              {showAdvanced && (
                <div className="advanced-panel">
                  <p className="summary-label">Technical steps completed</p>
                  <ol className="steps-plain">
                    {run.step_executions.map((s) => (
                      <li key={s.order} className={s.status === "COMPLETED" ? "done" : ""}>
                        {friendlyStepLabel(s.agent_id)}
                      </li>
                    ))}
                  </ol>
                  <p className="fine-print">
                    Powered by Burin (spatiotemporal seals) + Pathways (auditable workflow). Proves record
                    integrity, not that the world matches your claim.
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
