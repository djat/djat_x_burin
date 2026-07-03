import { useEffect, useState } from "react";
import { OVERVIEW_SECTIONS, type OverviewSectionId } from "../content/overviewSections";

function scrollToSection(id: OverviewSectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function OverviewSectionNav() {
  const [activeId, setActiveId] = useState<OverviewSectionId>("overview-start");

  useEffect(() => {
    const sections = OVERVIEW_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0]?.target.id as OverviewSectionId | undefined;
        if (top) setActiveId(top);
      },
      { rootMargin: "-10% 0px -55% 0px", threshold: [0, 0.1, 0.5] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="overview-section-nav" aria-label="On this page">
      <span className="overview-section-nav-label">On this page</span>
      <ol className="overview-section-nav-list">
        {OVERVIEW_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={`overview-section-nav-item ${activeId === section.id ? "active" : ""}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { scrollOverviewToTop } from "../scroll";
