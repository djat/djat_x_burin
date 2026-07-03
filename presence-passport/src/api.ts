const API_BASE = "";

export type Template = {
  id: string;
  identity: string;
  display_name: string;
  description: string;
  license_terms: Record<string, unknown>;
};

export type PathwayRun = {
  id: string;
  template_identity: string;
  status: string;
  step_executions: Array<{ order: number; agent_id: string; status: string; output_markdown?: string }>;
  step_artifacts: Record<string, Record<string, unknown>>;
  final_output?: string;
  aqua_stub_id?: string;
  error_message?: string;
};

export type Persona = {
  id: string;
  name: string;
  role: string;
  templateMatch: string;
  icon: string;
  /** Who said it and what they asked for */
  trigger: string;
  /** One sentence: why this matters to them right now */
  situation: string;
  /** What they'd do without this tool */
  withoutThis: string;
  /** What they attach instead */
  withThis: string;
  youCanNow: string[];
  mapTitle: string;
  mapIntro: string;
};

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/api/pathway-templates`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Could not load workflows (${res.status})`);
  }
  return res.json();
}

export async function launchPathway(pathwayId: string, inputs: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/pathways/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathway_id: pathwayId, inputs }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg).join("; ")
          : data.message || data.error?.message || `Could not create proof (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function exportBundle(runId: string) {
  const res = await fetch(`${API_BASE}/api/pathways/${runId}/export-bundle`);
  if (!res.ok) throw new Error("Could not download your proof file");
  return res.blob();
}

/** Persona-anchored scenarios — each maps to a pathway template */
export const PERSONAS: Persona[] = [
  {
    id: "maria",
    name: "Maria Reyes",
    role: "Volunteer bird monitor · Hudson Estuary chapter",
    templateMatch: "Presence.Survey.EffortProof",
    icon: "🦅",
    trigger:
      "Grant officer: “We need proof transects B and C were walked this quarter — but your data policy says no exact nest coordinates in the report.”",
    situation: "Renewal is due Friday. She walked the routes; she just needs something the funder can verify without publishing sensitive spots.",
    withoutThis: "A Word doc saying “I covered the area” and a GPS screenshot she’s not allowed to attach.",
    withThis: "A proof file on the quarterly report: “effort in this zone, this date” — verifiable, no nest pins.",
    youCanNow: [
      "Satisfy the grant without breaking your chapter’s location-privacy rules",
      "Let the funder verify offline — no back-and-forth calls",
      "Reuse the same file if a second reviewer asks",
    ],
    mapTitle: "Where did you walk transects B and C?",
    mapIntro:
      "Tap the marsh or trail section you covered. The proof says “work happened in this zone” — not your step-by-step path or nest locations.",
  },
  {
    id: "james",
    name: "James Okonkwo",
    role: "Phase I environmental consultant · solo practice",
    templateMatch: "Presence.Survey.EffortProof",
    icon: "🌿",
    trigger:
      "Client’s attorney: “Before we sign off on the closing memo, show defensible documentation that you physically inspected parcel 14-B.”",
    situation: "The walkover happened. Legal doesn’t want a raw GPS track in discovery — they want something checkable that still holds up.",
    withoutThis: "Field notes PDF and a photo of his boots — easy for opposing counsel to call “self-serving.”",
    withThis: "A sealed proof tied to the parcel boundary and inspection date, attachable to the memo package.",
    youCanNow: [
      "Give legal something stronger than notes and photos",
      "Prove the inspection zone without dumping a full GPS trace",
      "Let their team verify without calling you as a witness",
    ],
    mapTitle: "Which parcel did you inspect?",
    mapIntro: "Tap the map on parcel 14-B (or the site you walked). This anchors proof to that ground and today’s date.",
  },
  {
    id: "denise",
    name: "Denise Washington",
    role: "Home health aide · visiting nurse agency",
    templateMatch: "Presence.Field.CaptureSeal",
    icon: "🏥",
    trigger:
      "Payroll: “Visit log for Mrs. Chen on March 12 doesn’t match our system. No reimbursement until you prove you were there.”",
    situation: "She was at the apartment for 45 minutes. The EVV app glitched. She needs her $87 visit pay and a clean record.",
    withoutThis: "A text to her supervisor: “I swear I was there” — and waiting two pay cycles while they “investigate.”",
    withThis: "Proof stamped to that building and date, attached to her timesheet dispute ticket.",
    youCanNow: [
      "Answer payroll with evidence, not an argument",
      "Send a file they can check without logging into your phone",
      "Keep a copy if the dispute gets forwarded up the chain",
    ],
    mapTitle: "Where was Mrs. Chen’s visit?",
    mapIntro: "Tap the building or block. Proof ties to that address area and today — not your live location history.",
  },
  {
    id: "carlos",
    name: "Carlos Mendez",
    role: "Municipal building inspector · permits & appeals",
    templateMatch: "Presence.Field.CaptureSeal",
    icon: "🏗️",
    trigger:
      "Contractor’s appeal: “Inspector Mendez never showed up on April 9. We want the failure overturned.”",
    situation: "He signed the failed framing inspection that morning. Admin hearing in ten days — he needs a record that survives “he said / she said.”",
    withoutThis: "His handwritten log and a calendar entry the contractor’s lawyer will call internal and editable.",
    withThis: "Timestamped proof for the job site, filed with the appeal response.",
    youCanNow: [
      "Back up your inspection log with something third parties can verify",
      "Show the file wasn’t altered after the hearing packet went out",
      "Verify offline at the hearing — no live system required",
    ],
    mapTitle: "Which job site was the April 9 inspection?",
    mapIntro: "Tap the property under appeal. Proof locks to that site and the inspection date.",
  },
];

/** Short quotes for the welcome screen — same people, punchier */
export const HERO_VIGNETTES = PERSONAS.map((p) => ({
  who: p.name.split(" ")[0],
  role: p.role.split(" · ")[0],
  quote: p.trigger.split(":").slice(1).join(":").trim().replace(/^“|”$/g, ""),
}));

export function friendlyStepLabel(agentId: string): string {
  const map: Record<string, string> = {
    burin_canonicalize: "Recording the area you worked in",
    burin_presence: "Locking in date, time, and place",
    burin_zk: "Confirming coverage without exposing exact spots",
    burin_export: "Packaging proof you can email or upload",
  };
  return map[agentId] || "Finishing up…";
}

export function getPersona(id: string) {
  return PERSONAS.find((p) => p.id === id);
}
