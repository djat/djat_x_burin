import { DevBlock } from "./DevToggle";
import { StackPreview } from "./StackPreview";
import { WaterReportingPanel } from "./WaterReportingPanel";
import { OVERVIEW } from "../content/overview";
import { PATHWAY_CATALOG } from "../api";

type OverviewPageProps = {
  devMode: boolean;
  onStartJourney: () => void;
};

export function OverviewPage({ devMode, onStartJourney }: OverviewPageProps) {
  const o = OVERVIEW;

  return (
    <article className="overview">
      <header id="overview-start" className="overview-hero">
        <p className="overview-eyebrow">Transect Trust · Estuary field hub</p>
        <h1>{o.headline}</h1>
        <p className="overview-subhead">{o.subhead}</p>
        <button type="button" className="primary overview-cta" onClick={onStartJourney}>
          {o.cta.button}
        </button>
      </header>

      <StackPreview devMode={devMode} />

      <section id="overview-centerpiece" className="overview-section overview-centerpiece">
        <h2>{o.centerpiece.title}</h2>
        <p className="overview-intro overview-centerpiece-lead">{o.centerpiece.lead}</p>

        <div className="habitat-strip">
          {o.centerpiece.habitats.map((h) => (
            <article key={h.name} className="habitat-chip">
              <h3>{h.name}</h3>
              <p>{h.example}</p>
            </article>
          ))}
        </div>

        <article className="domains-callout">
          <h3>{o.centerpiece.domains.title}</h3>
          <p>{o.centerpiece.domains.body}</p>
        </article>

        <ol className="collab-flow">
          {o.centerpiece.howItWorks.map((item, i) => (
            <li key={item.step}>
              <span className="collab-step-num">{i + 1}</span>
              <div>
                <strong>{item.step}</strong>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <blockquote className="centerpiece-example">{o.centerpiece.example}</blockquote>

        <aside className="honest-limit honest-limit-inline">
          <strong>Demo boundary:</strong> {o.centerpiece.honestNote}
        </aside>
      </section>

      <section id="overview-water" className="overview-section overview-water">
        <h2>{o.waterReporting.title}</h2>
        <p className="overview-intro">{o.waterReporting.lead}</p>
        <p className="overview-intro water-network-gate">{o.waterReporting.networkGate}</p>
        <p className="overview-intro">{o.waterReporting.crossProject}</p>
        <WaterReportingPanel variant="overview" devMode={devMode} />
      </section>

      <section id="overview-special" className="overview-section">
        <h2>{o.whatsSpecial.title}</h2>
        <div className="overview-card-grid">
          {o.whatsSpecial.points.map((p) => (
            <article key={p.title} className="overview-card">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="overview-first-time" className="overview-section overview-section-highlight">
        <h2>{o.firstTimeDemo.title}</h2>
        <p className="overview-intro">{o.firstTimeDemo.intro}</p>
        <div className="demo-claims">
          {o.firstTimeDemo.items.map((item) => (
            <article key={item.claim} className="demo-claim">
              <h3>{item.claim}</h3>
              <p>{item.detail}</p>
              <p className="demo-contrast">
                <strong>Unlike today:</strong> {item.contrast}
              </p>
            </article>
          ))}
        </div>
        <aside className="honest-limit">
          <strong>Honest boundary:</strong> {o.firstTimeDemo.honestLimit}
        </aside>
      </section>

      <section id="overview-audiences" className="overview-section">
        <h2>{o.audiences.title}</h2>
        <p className="overview-intro">{o.audiences.intro}</p>

        <h3 className="audience-group-label">{o.audiences.institutional.label}</h3>
        <div className="audience-grid">
          {o.audiences.institutional.parties.map((party) => (
            <article key={party.who} className="audience-card audience-card-institutional">
              <h3>{party.who}</h3>
              <p className="audience-org">{party.org}</p>
              <p>{party.why}</p>
            </article>
          ))}
        </div>

        <h3 className="audience-group-label">{o.audiences.community.label}</h3>
        <div className="audience-grid">
          {o.audiences.community.parties.map((party) => (
            <article key={party.who} className="audience-card audience-card-community">
              <h3>{party.who}</h3>
              <p className="audience-org">{party.org}</p>
              <p>{party.why}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="overview-technology" className="overview-section overview-tech">
        <h2>{o.technology.title}</h2>
        <p className="overview-intro">{o.technology.intro}</p>

        <div className="tech-columns">
          <article className="tech-block">
            <h3>{o.technology.burin.name}</h3>
            <p className="tech-tagline">{o.technology.burin.tagline}</p>
            {o.technology.burin.paragraphs.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            <ul className="tech-powers">
              {o.technology.burin.powers.map((power) => (
                <li key={power}>{power}</li>
              ))}
            </ul>
          </article>

          <article className="tech-block">
            <h3>{o.technology.pathways.name}</h3>
            <p className="tech-tagline">{o.technology.pathways.tagline}</p>
            {o.technology.pathways.paragraphs.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            <ul className="tech-powers">
              {o.technology.pathways.powers.map((power) => (
                <li key={power}>{power}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="tech-together">
          <h3>{o.technology.together.title}</h3>
          {o.technology.together.paragraphs.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <blockquote className="tech-analogy">{o.technology.together.analogy}</blockquote>
        </article>

        <DevBlock enabled={devMode}>
          <div className="dev-context overview-dev">
            <p className="dev-context-title">Developer context: encoded templates in this demo</p>
            <ul className="pathway-list">
              {PATHWAY_CATALOG.map((p) => (
                <li key={p}>
                  <code>{p}</code>
                </li>
              ))}
            </ul>
            <p className="prov-meta">
              Reference architecture: PATHWAYS_ARCHITECTURE §9.9 Burin substrate · dual-attestation bundles ·
              Conservation domain IP (Transect Trust v1)
            </p>
          </div>
        </DevBlock>
      </section>

      <footer id="overview-cta" className="overview-footer">
        <h2>{o.cta.title}</h2>
        <p>{o.cta.body}</p>
        <button type="button" className="primary overview-cta" onClick={onStartJourney}>
          {o.cta.button}
        </button>
      </footer>
    </article>
  );
}
