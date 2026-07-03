import { DevBlock } from "./DevToggle";
import { OVERVIEW } from "../content/overview";
import { PATHWAY_CATALOG } from "../api";

export function StackPreview({ devMode }: { devMode: boolean }) {
  const p = OVERVIEW.stackPreview;
  const tk = p.trustKey;

  return (
    <section id="overview-stack" className="overview-section stack-preview">
      <h2>{p.title}</h2>
      <p className="overview-intro stack-preview-intro">{p.intro}</p>

      <div className="stack-preview-columns">
        <article className="stack-preview-card stack-preview-burin">
          <header>
            <span className="stack-order">1</span>
            <div>
              <h3>{p.burin.name}</h3>
              <p className="stack-tagline">{p.burin.tagline}</p>
            </div>
          </header>
          <p>{p.burin.body}</p>
          <ul className="stack-highlights">
            {p.burin.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </article>

        <article className="stack-preview-card stack-preview-pathways">
          <header>
            <span className="stack-order">2</span>
            <div>
              <h3>{p.pathways.name}</h3>
              <p className="stack-tagline">{p.pathways.tagline}</p>
            </div>
          </header>
          <p>{p.pathways.body}</p>
          <ul className="stack-highlights">
            {p.pathways.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </article>
      </div>

      <section id="overview-trust-key" className="stack-trust-key-section">
        <header className="stack-trust-key-header">
          <span className="stack-order">3</span>
          <div>
            <h3>{tk.name}</h3>
            <p className="stack-tagline">{tk.tagline}</p>
          </div>
        </header>
        <p className="stack-trust-key-body">{tk.body}</p>
        <p className="trust-key-technique">
          <code>{tk.technique}</code>
          {" · "}
          <code>{tk.verifyTechnique}</code>
          {" · "}
          <code>{tk.pattern}</code>
        </p>
        <p className="trust-key-authors">
          {tk.authors.map((a, i) => (
            <span key={a.name}>
              {i > 0 ? " · " : ""}
              {a.name} ({a.role})
            </span>
          ))}
        </p>
        <ul className="trust-key-aspects">
          {tk.uniqueAspects.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="trust-key-dimension-examples">
          <p className="trust-key-dimension-lead">
            Deep links accept dimensional parameters — same root key, scoped context:
          </p>
          <p className="trust-key-dimension-params">
            <code>{tk.dimensionParams}</code>
          </p>
          <ul className="trust-key-example-list">
            {tk.dimensionLinkExamples.map((ex) => (
              <li key={ex.label}>
                <strong>{ex.label}</strong>
                {ex.oneTime ? <span className="trust-key-one-time"> · one-time key</span> : null}
                <p className="trust-key-example-note">{ex.note}</p>
                <code className="trust-key-example-link">
                  transect-trust://context/&#123;context_id&#125;?trust_key=&#123;id&#125;&amp;{ex.params}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <article className="stack-preview-together">
        <h3>{p.together.title}</h3>
        <p className="stack-together-lead">{p.together.lead}</p>

        <h4 className="stack-composition-title">{p.together.compositionTitle}</h4>
        <div className="stack-together-points">
          {p.together.points.map((pt) => (
            <div key={pt.label} className="stack-together-point">
              <strong>{pt.label}</strong>
              <p>{pt.detail}</p>
            </div>
          ))}
        </div>

        <div className="stack-together-example">
          <h4>{p.together.exampleTitle}</h4>
          <p>{p.together.exampleBody}</p>
        </div>

        <p className="stack-in-demo">{p.together.inThisDemo}</p>
      </article>

      <DevBlock enabled={devMode}>
        <div className="dev-context stack-preview-dev">
          <p className="dev-context-title">Developer context: templates in this composition</p>
          <ul className="pathway-list">
            {PATHWAY_CATALOG.map((id) => (
              <li key={id}>
                <code>{id}</code>
              </li>
            ))}
          </ul>
        </div>
      </DevBlock>
    </section>
  );
}
