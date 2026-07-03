import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Rectangle, useMapEvents } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import { WITHOUT_EXCHANGING } from "./content/privacyFloor";
import { OverviewPage } from "./components/OverviewPage";
import { OverviewSectionNav, scrollOverviewToTop } from "./components/OverviewSectionNav";
import { scrollJourneyToTop } from "./scroll";
import { ThemeToggle } from "./components/ThemeToggle";
import { applyTheme, getInitialTheme, type Theme } from "./theme";
import { DevBlock, DevToggle } from "./components/DevToggle";
import { WaterReportingPanel } from "./components/WaterReportingPanel";
import { buildWaterSubmission } from "./content/waterNetwork";
import { ProvenancePanel, TrustStackPanel, type RunProvenance, type TrustStack } from "./components/ProvenancePanel";
import {
  GUIDE_STEPS,
  QUARTER,
  DEMO_GRANT,
  getRunIdForStep,
  getStepStatus,
  runSucceeded,
  type GuideStep,
  type GuideStepId,
} from "./guide";
import {
  closeQuarter,
  fetchEcosystem,
  fetchRun,
  fetchRunProvenance,
  fetchTrustStack,
  friendlyTemplate,
  issueGrantAward,
  partyByRole,
  registerProgram,
  reviewSubmission,
  submitFieldEffort,
  verifyQuarter,
  type Ecosystem,
  type PathwayRunDetail,
} from "./api";

type View = "overview" | "journey" | "technical";

function geoToBounds(geo: { coordinates: number[][][] }): LatLngBounds {
  const ring = geo.coordinates[0];
  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;
  for (const [lng, lat] of ring) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }
  return L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
}

function innerWorkZone(unitBounds: LatLngBounds): LatLngBounds {
  const sw = unitBounds.getSouthWest();
  const ne = unitBounds.getNorthEast();
  const padLat = (ne.lat - sw.lat) * 0.15;
  const padLng = (ne.lng - sw.lng) * 0.15;
  return L.latLngBounds([sw.lat + padLat, sw.lng + padLng], [ne.lat - padLat, ne.lng - padLng]);
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

function RunPanel({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [run, setRun] = useState<PathwayRunDetail | null>(null);
  useEffect(() => {
    fetchRun(runId).then(setRun).catch(() => setRun(null));
  }, [runId]);
  if (!run) return <div className="run-panel loading">Loading run…</div>;
  return (
    <div className="run-panel">
      <header>
        <div>
          <span className="run-id">{run.id}</span>
          <h3>{friendlyTemplate(run.template_identity)}</h3>
        </div>
        <button type="button" className="ghost" onClick={onClose}>×</button>
      </header>
      <p className={`status-pill status-${run.status.toLowerCase()}`}>{run.status}</p>
      {run.provenance && (
        <div className="run-panel-provenance">
          <ProvenancePanel provenance={run.provenance} compact />
        </div>
      )}
      <ol className="step-list">
        {run.step_executions.map((s) => (
          <li key={s.order} className={s.status === "COMPLETED" ? "done" : ""}>
            <span className="step-agent">{s.agent_id}</span>
            {s.output_markdown}
          </li>
        ))}
      </ol>
      <details>
        <summary>Raw step artifacts</summary>
        <pre>{JSON.stringify(run.step_artifacts, null, 2)}</pre>
      </details>
    </div>
  );
}

function DevStepContext({
  step,
  runId,
  onViewRun,
}: {
  step: GuideStep;
  runId: string | null;
  onViewRun: (id: string) => void;
}) {
  const [provenance, setProvenance] = useState<RunProvenance | null>(null);

  useEffect(() => {
    if (!runId) {
      setProvenance(null);
      return;
    }
    fetchRunProvenance(runId).then(setProvenance).catch(() => setProvenance(null));
  }, [runId]);

  return (
    <>
      <p className="dev-context-title">Developer context</p>
      <dl className="dev-dl">
        <dt>Pathway template</dt>
        <dd><code>{step.dev.pathway}</code></dd>
        <dt>API</dt>
        <dd><code>{step.dev.api}</code></dd>
        <dt>Actor account ID</dt>
        <dd><code>{step.dev.actorAccountId}</code></dd>
        <dt>Run link role</dt>
        <dd><code>{step.dev.edgeRole}</code></dd>
        {step.dev.agents && (
          <>
            <dt>Agents</dt>
            <dd><code>{step.dev.agents.join(", ")}</code></dd>
          </>
        )}
        {runId && (
          <>
            <dt>PathwayRun</dt>
            <dd>
              <button type="button" className="link" onClick={() => onViewRun(runId)}>
                {runId}
              </button>
            </dd>
          </>
        )}
      </dl>

      {provenance ? (
        <ProvenancePanel provenance={provenance} compact />
      ) : (
        <div className="prov-pending">
          <p className="prov-meta">After this step completes, provenance will list devices, data sources, signer account ID, and trust layers assumed.</p>
          <p className="prov-meta"><strong>Actor account:</strong> <code>{step.dev.actorAccountId}</code></p>
        </div>
      )}
    </>
  );
}

function StepAction({
  step,
  eco,
  busy,
  devMode,
  unit,
  unitBounds,
  workBounds,
  setWorkBounds,
  onAct,
  onViewRun,
  mapColors,
}: {
  step: GuideStep;
  eco: Ecosystem;
  busy: boolean;
  devMode: boolean;
  unit: Ecosystem["reporting_units"][0] | undefined;
  unitBounds: LatLngBounds | null;
  workBounds: LatLngBounds | null;
  setWorkBounds: (b: LatLngBounds) => void;
  onAct: (fn: () => Promise<unknown>) => void;
  onViewRun: (id: string) => void;
  mapColors: { unit: string; zone: string };
}) {
  const status = getStepStatus(step.id, eco);
  const runId = getRunIdForStep(step.id, eco);
  const grant = eco.grants.find((g) => g.id === DEMO_GRANT);
  const submission = eco.submissions.find((s) => s.grant_id === DEMO_GRANT && s.quarter === QUARTER);
  const maria = partyByRole(eco.parties, "field_monitor");
  const [honoredWaterRequests, setHonoredWaterRequests] = useState<string[]>(["req_nea_quarter_panel"]);

  const toggleWaterRequest = useCallback((id: string) => {
    setHonoredWaterRequests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isDone = status === "complete";
  const isCurrent = status === "current";
  const isWaiting = status === "waiting";

  async function handleClick() {
    switch (step.id) {
      case "program_rules":
        return onAct(registerProgram);
      case "grant_award":
        return onAct(() => issueGrantAward(DEMO_GRANT));
      case "field_submit":
        if (!maria || !workBounds) return;
        return onAct(() =>
          submitFieldEffort({
            grant_id: DEMO_GRANT,
            monitor_did: maria.did,
            monitor_name: maria.name,
            quarter: QUARTER,
            transect_ids: ["B", "C"],
            polygon_geojson: boundsToGeoJSON(workBounds),
            water_observations: buildWaterSubmission(honoredWaterRequests),
          })
        );
      case "coordinator_review":
        if (!submission) return;
        return onAct(() => reviewSubmission(submission.id));
      case "funder_verify":
        return onAct(() => verifyQuarter(eco.program!.id, DEMO_GRANT, QUARTER));
      case "quarter_close":
        return onAct(() => closeQuarter(eco.program!.id, QUARTER));
    }
  }

  function isDisabled(): boolean {
    if (busy || isDone || !isCurrent) return true;
    switch (step.id) {
      case "grant_award":
        return !eco.program?.program_run_id;
      case "field_submit":
        return !grant?.award_run_id;
      case "coordinator_review":
        return !submission?.field_run_id;
      case "funder_verify":
        return !runSucceeded(eco, submission?.review_run_id);
      case "quarter_close":
        return !eco.quarter_closes.find((c) => c.quarter === QUARTER)?.verify_run_id;
      default:
        return false;
    }
  }

  return (
    <article className={`guide-step-card ${status}`} id={`step-${step.id}`}>
      <div className="guide-step-head">
        <span className="guide-step-num">Step {step.order}</span>
        <span className="guide-step-phase">{step.phase}</span>
        {isDone && <span className="guide-step-badge done">Complete</span>}
        {isCurrent && <span className="guide-step-badge current">Your turn</span>}
        {isWaiting && <span className="guide-step-badge wait">Waiting</span>}
      </div>

      <div className="who-block">
        <span className="who-label">Who</span>
        <p className="who-name">{step.who.name}</p>
        <p className="who-meta">
          {step.who.role} · {step.who.organization}
        </p>
      </div>

      <div className="goal-block">
        <span className="goal-label">Trying to accomplish</span>
        <p>{step.accomplishing}</p>
      </div>

      <div className="why-block">
        <span className="why-label">Why it matters</span>
        <p>{step.whyItMatters}</p>
      </div>

      {isWaiting && step.waitingMessage && (
        <p className="waiting-msg">{step.waitingMessage}</p>
      )}

      {isCurrent && step.id === "field_submit" && unit && unitBounds && workBounds && (
        <>
          <div className="map-wrap">
            <MapContainer bounds={unitBounds} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              <GeoJSON
                data={unit.geojson}
                pathOptions={{ color: mapColors.unit, weight: 2, fillOpacity: 0.08, dashArray: "6 4" }}
              />
              <Rectangle bounds={workBounds} pathOptions={{ color: mapColors.zone, weight: 2, fillOpacity: 0.3 }} />
              <MapClick bounds={unitBounds} onPick={setWorkBounds} />
            </MapContainer>
          </div>
          <p className="map-hint">
            Tap the map inside the green estuary boundary (marsh, seagrass edge, or mangrove fringe). Blue = the zone
            Maria&apos;s proof will cover at public-unit resolution, {WITHOUT_EXCHANGING}.
          </p>
          <WaterReportingPanel
            variant="field"
            devMode={devMode}
            honoredRequestIds={honoredWaterRequests}
            onToggleRequest={toggleWaterRequest}
          />
        </>
      )}

      {isCurrent && (
        <>
          <div className="action-block">
            <span className="action-label">What to do</span>
            <p>{step.yourAction}</p>
            <button type="button" className="primary" disabled={isDisabled()} onClick={handleClick}>
              {isDone ? step.buttonLabelDone : step.buttonLabel}
            </button>
          </div>
          <p className="next-block">
            <strong>Then:</strong> {step.whatHappensNext}
          </p>
        </>
      )}

      {isDone && (
        <p className="done-block">
          ✓ {step.buttonLabelDone}. {step.whatHappensNext}
        </p>
      )}

      <DevBlock enabled={devMode}>
        <DevStepContext step={step} runId={runId} onViewRun={onViewRun} />
      </DevBlock>
    </article>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [devMode, setDevMode] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [focusedStep, setFocusedStep] = useState<GuideStepId | null>(null);
  const [eco, setEco] = useState<Ecosystem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [workBounds, setWorkBounds] = useState<LatLngBounds | null>(null);
  const [trustStack, setTrustStack] = useState<TrustStack | null>(null);
  const [scrollJourneyPending, setScrollJourneyPending] = useState(false);
  const [scrollOverviewPending, setScrollOverviewPending] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!scrollJourneyPending || view !== "journey") return;
    scrollJourneyToTop();
    setScrollJourneyPending(false);
  }, [scrollJourneyPending, view, eco]);

  useEffect(() => {
    if (!scrollOverviewPending || view !== "overview") return;
    scrollOverviewToTop();
    setScrollOverviewPending(false);
  }, [scrollOverviewPending, view]);

  const mapColors = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      unit: s.getPropertyValue("--map-unit").trim() || "#3cb87a",
      zone: s.getPropertyValue("--map-zone").trim() || "#5b9cf4",
    };
  }, [theme]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchEcosystem();
      setEco(data);
      const grant = data.grants.find((g) => g.id === DEMO_GRANT);
      const unit = data.reporting_units.find((u) => u.id === grant?.unit_id);
      if (unit && !workBounds) setWorkBounds(innerWorkZone(geoToBounds(unit.geojson)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [workBounds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (devMode) {
      fetchTrustStack().then(setTrustStack).catch(() => setTrustStack(null));
    }
  }, [devMode, eco]);

  const grant = eco?.grants.find((g) => g.id === DEMO_GRANT);
  const unit = eco?.reporting_units.find((u) => u.id === grant?.unit_id);
  const unitBounds = useMemo(() => (unit ? geoToBounds(unit.geojson) : null), [unit]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const displayStep = focusedStep ?? (eco ? GUIDE_STEPS.find((s) => getStepStatus(s.id, eco) === "current")?.id : null);

  function goHome() {
    setView("overview");
    setFocusedStep(null);
    setScrollOverviewPending(true);
  }

  function startJourney() {
    setView("journey");
    setFocusedStep(null);
    setScrollJourneyPending(true);
  }

  return (
    <div className={`hub ${devMode ? "dev-mode-on" : "dev-mode-off"}`}>
      <aside className="sidebar">
        <button type="button" className="brand brand-home" onClick={goHome} title="Back to overview start">
          <span className="brand-mark">TT</span>
          <div>
            <strong>Transect Trust</strong>
            <span className="brand-sub">Estuary field hub, marsh, seagrass, mangrove</span>
          </div>
        </button>

        <ThemeToggle theme={theme} onChange={setTheme} />
        <DevToggle enabled={devMode} onChange={setDevMode} />

        <p className="sidebar-lead">
          {devMode
            ? "Guided quarter workflow, developer overlay shows PathwayRuns."
            : "Follow each step: who acts, what they need, what happens next."}
        </p>

        <nav className="guide-nav">
          <button type="button" className={view === "overview" ? "active" : ""} onClick={goHome}>
            Overview
          </button>
          <button type="button" className={view === "journey" ? "active" : ""} onClick={startJourney}>
            Quarter workflow
          </button>
          {devMode && (
            <button type="button" className={view === "technical" ? "active" : ""} onClick={() => setView("technical")}>
              Run graph ({eco?.conservation_runs.length ?? 0})
            </button>
          )}
        </nav>

        {view === "overview" && <OverviewSectionNav />}

        {eco && view === "journey" && (
          <ol className="step-nav-list">
            {GUIDE_STEPS.map((step) => {
              const st = getStepStatus(step.id, eco);
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`step-nav-item ${st} ${displayStep === step.id ? "focused" : ""}`}
                    onClick={() => {
                      setView("journey");
                      setFocusedStep(step.id);
                      document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="step-nav-num">{step.order}</span>
                    <span className="step-nav-text">
                      <span className="step-nav-who">{step.who.name}</span>
                      <span className="step-nav-meta">
                        {step.who.role} · {step.who.organization}
                      </span>
                      <span className="step-nav-phase">{step.phase}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {eco?.program && (
          <div className="sidebar-program">
            <span className="label">Program</span>
            <p>{eco.program.name}</p>
            <span className="label">{QUARTER}</span>
          </div>
        )}
      </aside>

      <main className="main">
        <header className="top-bar" id="journey-start">
          <div>
            <h1 className="page-title">
              {view === "overview"
                ? "Overview"
                : view === "journey"
                  ? "Quarter reporting workflow"
                  : "Technical run graph"}
            </h1>
            {view === "overview" && (
              <p className="page-sub">
                Burin + Pathways preview, then the estuary demo: cross-habitat collaboration, water reporting, and
                quarter workflow.
              </p>
            )}
            {!devMode && view === "journey" && (
              <p className="page-sub">Guided for community and institutional users, no technical knowledge required.</p>
            )}
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {view === "overview" && (
          <OverviewPage devMode={devMode} onStartJourney={startJourney} />
        )}

        {view === "journey" && eco && (
          <section className="guide-journey">
            <div className="journey-intro">
              <h2>What this quarter is about</h2>
              <p>
                Hudson Estuary Audubon must prove community monitors walked bird-monitoring transects at{" "}
                <strong>Piermont Marsh</strong>, marsh, seagrass, and mangrove fringe in the same estuary,{" "}
                {WITHOUT_EXCHANGING}. While Maria seals her primary proof, the system can privately
                surface overlapping initiatives (seagrass beds, mangrove restoration, fungi wrack surveys) and private
                in-network water measurement requests she may honor on the same walk. Institutional and community organizations play a role; each step below says <em>who</em> acts and{" "}
                <em>why</em>.
              </p>
            </div>

            {devMode && trustStack && <TrustStackPanel stack={trustStack} />}

            {GUIDE_STEPS.map((step) => (
              <StepAction
                key={step.id}
                step={step}
                eco={eco}
                busy={busy}
                devMode={devMode}
                unit={unit}
                unitBounds={unitBounds}
                workBounds={workBounds}
                setWorkBounds={setWorkBounds}
                onAct={act}
                onViewRun={setSelectedRun}
                mapColors={mapColors}
              />
            ))}

            {GUIDE_STEPS.every((s) => getStepStatus(s.id, eco) === "complete") && (
              <div className="journey-complete">
                <h2>Quarter complete</h2>
                <p>
                  {QUARTER} is archived. The funder holds a Trust Key that deep-links back into program rules, the grant award,
                  Maria&apos;s field proof, Elena&apos;s chapter sign-off, and verification, ready for renewal audit.
                </p>
              </div>
            )}
          </section>
        )}

        {view === "technical" && devMode && eco && (
          <section className="panel">
            <p className="lead dev-only-note">Developer view: PathwayRun records and hypergraph links.</p>
            <div className="run-grid">
              {eco.conservation_runs.map((r) => (
                <button key={r.id} type="button" className="run-card" onClick={() => setSelectedRun(r.id)}>
                  <code>{r.id}</code>
                  <span>{friendlyTemplate(r.template_identity)}</span>
                  <span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span>
                </button>
              ))}
            </div>
            <table className="link-table">
              <thead>
                <tr>
                  <th>Edge role</th>
                  <th>Party</th>
                  <th>Run</th>
                </tr>
              </thead>
              <tbody>
                {eco.pathway_run_links.map((l) => (
                  <tr key={l.id}>
                    <td>{l.edge_role}</td>
                    <td><code>{l.party_did?.slice(0, 24)}…</code></td>
                    <td>
                      <button type="button" className="link" onClick={() => setSelectedRun(l.child_run_id)}>
                        {l.child_run_id}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {selectedRun && devMode && <RunPanel runId={selectedRun} onClose={() => setSelectedRun(null)} />}
    </div>
  );
}

function MapClick({ bounds, onPick }: { bounds: LatLngBounds; onPick: (b: LatLngBounds) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (!bounds.contains([lat, lng])) return;
      const pad = 0.008;
      onPick(L.latLngBounds([lat - pad, lng - pad], [lat + pad, lng + pad]));
    },
  });
  return null;
}
