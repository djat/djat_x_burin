import type { ReactNode } from "react";

type DevToggleProps = {
  enabled: boolean;
  onChange: (v: boolean) => void;
};

export function DevToggle({ enabled, onChange }: DevToggleProps) {
  return (
    <label className="dev-toggle" title="Show Pathway templates, run IDs, and API details">
      <span className="dev-toggle-label">Developer context</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`dev-switch ${enabled ? "on" : ""}`}
        onClick={() => onChange(!enabled)}
      >
        <span className="dev-switch-knob" />
      </button>
      <span className="dev-toggle-state">{enabled ? "On" : "Off"}</span>
    </label>
  );
}

type DevBlockProps = {
  enabled: boolean;
  children: ReactNode;
};

export function DevBlock({ enabled, children }: DevBlockProps) {
  if (!enabled) return null;
  return <div className="dev-context">{children}</div>;
}
