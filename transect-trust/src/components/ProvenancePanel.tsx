export type ProvenanceAccount = {
  party_id: string;
  account_id: string;
  did: string;
  role: string;
  name: string;
  organization: string;
};

export type ProvenanceDevice = {
  kind: string;
  ref: string;
  role: string;
};

export type ProvenanceDataSource = {
  kind: string;
  ref: string;
  role: string;
};

export type TrustLayer = {
  layer: string;
  assumption: string;
  who_must_act: string;
};

export type RunProvenance = {
  run_id: string;
  template_identity: string;
  actor_accounts: ProvenanceAccount[];
  burin_signer: {
    account_id: string;
    pubkey_hex: string;
    algorithm: string;
    custody: string;
    note: string;
  };
  seal_extract: Record<string, unknown>;
  devices_used: ProvenanceDevice[];
  devices_not_used: string[];
  data_sources: ProvenanceDataSource[];
  implicit_trust_layers: TrustLayer[];
};

export type TrustStack = {
  program_id: string;
  burin_signer: RunProvenance["burin_signer"];
  parties: Array<{ party_id: string; account_id: string; did: string; role: string; name: string }>;
  implicit_trust_layers: TrustLayer[];
  public_data_catalog: Array<{ unit_id: string; unit_code: string; source_ref: string }>;
};

export function ProvenancePanel({ provenance, compact }: { provenance: RunProvenance; compact?: boolean }) {
  return (
    <div className={`provenance-panel ${compact ? "compact" : ""}`}>
      <section>
        <h4>Account IDs</h4>
        <ul className="prov-list">
          {provenance.actor_accounts.map((a) => (
            <li key={a.party_id}>
              <code>{a.account_id}</code>
              <span className="prov-meta">{a.name} · <code>{a.did}</code></span>
            </li>
          ))}
          <li>
            <code>{provenance.burin_signer.account_id}</code>
            <span className="prov-meta">Burin seal signer · <code>{provenance.burin_signer.pubkey_hex.slice(0, 24)}…</code></span>
          </li>
        </ul>
      </section>

      {provenance.devices_used.length > 0 && (
        <section>
          <h4>Devices & clients used</h4>
          <ul className="prov-list">
            {provenance.devices_used.map((d) => (
              <li key={d.ref}>
                <strong>{d.kind}</strong>, {d.ref}
                <span className="prov-meta">{d.role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {provenance.devices_not_used.length > 0 && (
        <section>
          <h4>Not used in this proof</h4>
          <p className="prov-not-used">{provenance.devices_not_used.join(" · ")}</p>
        </section>
      )}

      <section>
        <h4>Data & inputs</h4>
        <ul className="prov-list">
          {provenance.data_sources.map((d, i) => (
            <li key={`${d.kind}-${i}`}>
              <strong>{d.kind}</strong>, <code>{d.ref}</code>
              <span className="prov-meta">{d.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {Object.keys(provenance.seal_extract).length > 0 && (
        <section>
          <h4>Extracted from seal</h4>
          <pre className="prov-pre">{JSON.stringify(provenance.seal_extract, null, 2)}</pre>
        </section>
      )}

      <section>
        <h4>Implicit trust assumed</h4>
        <ul className="trust-layer-list">
          {provenance.implicit_trust_layers.map((t) => (
            <li key={t.layer}>
              <strong>{t.layer}</strong>
              <p>{t.assumption}</p>
              <span className="prov-meta">Depends on: {t.who_must_act}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function TrustStackPanel({ stack }: { stack: TrustStack }) {
  return (
    <details className="trust-stack-panel">
      <summary>System-wide trust stack & account registry (developer)</summary>
      <div className="provenance-panel">
        <section>
          <h4>Burin signer (all seals this session)</h4>
          <p>
            <code>{stack.burin_signer.account_id}</code>, {stack.burin_signer.note}
          </p>
        </section>
        <section>
          <h4>Party account registry</h4>
          <ul className="prov-list">
            {stack.parties.map((p) => (
              <li key={p.party_id}>
                <code>{p.account_id}</code> · {p.name} ({p.role}), <code>{p.did}</code>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Public data catalog</h4>
          <ul className="prov-list">
            {stack.public_data_catalog.map((u) => (
              <li key={u.unit_id}>
                <code>{u.unit_code}</code>: {u.source_ref}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </details>
  );
}
