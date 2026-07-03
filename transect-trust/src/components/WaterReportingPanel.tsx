import { DevBlock } from "./DevToggle";
import { NO_GPS_OR_IDENTIFIABLE, WITHOUT_EXCHANGING } from "../content/privacyFloor";
import {
  DEMO_INTRINSIC_READINGS,
  ESTUARY_TRUST_NETWORK,
  INTRINSIC_WATER_PANEL,
  PRIVATE_WATER_REQUESTS,
  type PrivateWaterRequest,
} from "../content/waterNetwork";

type WaterReportingPanelProps = {
  variant: "overview" | "field";
  devMode: boolean;
  honoredRequestIds?: string[];
  onToggleRequest?: (id: string) => void;
};

function RequestCard({
  req,
  field,
  devMode,
  honored,
  onToggle,
}: {
  req: PrivateWaterRequest;
  field: boolean;
  devMode: boolean;
  honored?: boolean;
  onToggle?: (id: string) => void;
}) {
  return (
    <article className={`water-request ${req.projectType === "cross_project" ? "cross-project" : "intrinsic-req"}`}>
      <header className="water-request-head">
        <div>
          <h4>{req.project}</h4>
          <p className="water-requester">
            {req.requesterName} · {req.requesterOrg}
          </p>
        </div>
        <span className="network-badge" title="Enrolled on NE Estuary Trust Network">
          In network
        </span>
      </header>
      <p className="water-request-note">{req.note}</p>
      <ul className="water-measure-list">
        {req.measurements.map((m) => (
          <li key={`${req.id}-${m.param}`}>
            <strong>{m.label}</strong>
            {m.unit && <span className="water-unit"> ({m.unit})</span>}
            {m.method && <span className="water-method"> · {m.method}</span>}
          </li>
        ))}
      </ul>
      {field && onToggle && (
        <label className="water-opt-in">
          <input type="checkbox" checked={!!honored} onChange={() => onToggle(req.id)} />
          Honor this private request with my field submission
        </label>
      )}
      <DevBlock enabled={devMode}>
        <p className="prov-meta">
          <code>{req.requesterDid}</code> · visibility: {req.visibility} · network: {req.networkRef}
        </p>
      </DevBlock>
    </article>
  );
}

export function WaterReportingPanel({
  variant,
  devMode,
  honoredRequestIds = [],
  onToggleRequest,
}: WaterReportingPanelProps) {
  const isField = variant === "field";
  const intrinsicReq = PRIVATE_WATER_REQUESTS.filter((r) => r.projectType === "intrinsic");
  const crossReq = PRIVATE_WATER_REQUESTS.filter((r) => r.projectType === "cross_project");

  return (
    <section className={`water-reporting ${variant}`}>
      <header className="water-reporting-head">
        <h3>{isField ? "Water reporting on this walk" : "Intrinsic & cross-project water reporting"}</h3>
        <p className="water-network-intro">
          <span className="network-badge">{ESTUARY_TRUST_NETWORK.name}</span>
          {isField
            ? " Private measurement requests appear because the requester is enrolled on your program trust network, not public broadcast."
            : " Water observations attach to bounded field sessions. Cross-project requests arrive privately from network members."}
        </p>
      </header>

      <article className="water-intrinsic-block">
        <h4>{INTRINSIC_WATER_PANEL.title}</h4>
        <p>{INTRINSIC_WATER_PANEL.lead}</p>
        <ul className="water-param-grid">
          {INTRINSIC_WATER_PANEL.parameters.map((p) => (
            <li key={p.param}>
              <span className="water-param-label">{p.label}</span>
              <span className="water-param-meta">
                {p.unit}
                {p.method ? ` · ${p.method}` : ""}
              </span>
              {isField && (
                <span className="water-demo-val">Demo: {DEMO_INTRINSIC_READINGS[p.param] ?? "n/a"}</span>
              )}
            </li>
          ))}
        </ul>
      </article>

      <div className="water-requests-section">
        <h4>Private requests, institutional & community (in-network only)</h4>
        <p className="water-requests-lead">
          These parties share the program trust card. Their asks are routed to monitors already sealing effort in
          overlapping units, cross-project water reporting {WITHOUT_EXCHANGING}.
        </p>

        {intrinsicReq.length > 0 && (
          <>
            <h5 className="water-subhead">Program compliance</h5>
            <div className="water-request-grid">
              {intrinsicReq.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  field={isField}
                  devMode={devMode}
                  honored={honoredRequestIds.includes(req.id)}
                  onToggle={onToggleRequest}
                />
              ))}
            </div>
          </>
        )}

        <h5 className="water-subhead">Cross-project opportunities</h5>
        <div className="water-request-grid">
          {crossReq.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              field={isField}
              devMode={devMode}
              honored={honoredRequestIds.includes(req.id)}
              onToggle={onToggleRequest}
            />
          ))}
        </div>
      </div>

      <DevBlock enabled={devMode}>
        <div className="dev-context water-dev">
          <p className="dev-context-title">Developer context, water observation linkage</p>
          <ul className="pathway-list">
            <li>
              <code>Conservation.Field.EffortSubmit@v1</code>, water_observations + honored_private_requests in run
              inputs
            </li>
            <li>
              <code>Conservation.Water.Observation@v1</code> (planned), standalone cross-project water PathwayRun
            </li>
          </ul>
          <p className="prov-meta">
            Network gate: requester DID must appear on program trust card · Burin seals readings to same coverage root
            · {NO_GPS_OR_IDENTIFIABLE}
          </p>
        </div>
      </DevBlock>
    </section>
  );
}
