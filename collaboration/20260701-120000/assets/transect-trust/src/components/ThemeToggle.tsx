import type { Theme } from "../theme";

type ThemeToggleProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const isLight = theme === "light";

  return (
    <label className="theme-toggle" title="Switch light and dark appearance">
      <span className="theme-toggle-label">Appearance</span>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? "Light mode on" : "Dark mode on"}
        className={`theme-switch ${isLight ? "light" : "dark"}`}
        onClick={() => onChange(isLight ? "dark" : "light")}
      >
        <span className="theme-switch-knob" />
      </button>
      <span className="theme-toggle-state">{isLight ? "Light" : "Dark"}</span>
    </label>
  );
}
