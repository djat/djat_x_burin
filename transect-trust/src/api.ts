import { WITHOUT_EXCHANGING } from "./content/privacyFloor";

const API = import.meta.env.VITE_API_URL ?? "";

export type PartyRole =
  | "funder_program_officer"
  | "chapter_coordinator"
  | "field_monitor"
  | "grantee_organization"
  | "presence_witness";

export type Party = {
  id: string;
  did: string;
  role: PartyRole;
  name: string;
  organization: string;
  description: string;
};

export type ReportingUnit = {
  id: string;
  unit_code: string;
  name: string;
  unit_type: string;
  source_ref: string;
  geojson: { type: "Polygon"; coordinates: number[][][] };
  boundary_fingerprint: string | null;
};

export type Grant = {
  id: string;
  grantee_party_id: string;
  unit_id: string;
  award_run_id: string | null;
  boundary_fingerprint: string | null;
  award_amount_usd: number;
  reporting_quarters: string[];
  status: string;
};

export type Submission = {
  id: string;
  grant_id: string;
  monitor_party_id: string;
  quarter: string;
  transect_ids: string[];
  field_run_id: string | null;
  review_run_id: string | null;
  status: string;
};

export type PathwayRunLink = {
  id: string;
  parent_run_id: string | null;
  child_run_id: string;
  edge_role: string;
  party_did: string | null;
  entity_type: string;
  entity_id: string;
};

export type ConservationRun = {
  id: string;
  template_identity: string;
  status: string;
  created_at: string | null;
};

export type Ecosystem = {
  program: {
    id: string;
    name: string;
    status: string;
    program_run_id: string | null;
    trust_card: Record<string, unknown>;
    acceptance_policy: Record<string, unknown>;
  } | null;
  parties: Party[];
  reporting_units: ReportingUnit[];
  grants: Grant[];
  submissions: Submission[];
  quarter_closes: Array<{
    id: string;
    quarter: string;
    verify_run_id: string | null;
    close_run_id: string | null;
    verification_passed: boolean;
    status: string;
  }>;
  pathway_run_links: PathwayRunLink[];
  conservation_runs: ConservationRun[];
};

import type { RunProvenance, TrustStack } from "./components/ProvenancePanel";

export type { RunProvenance, TrustStack };

export type PathwayRunDetail = {
  id: string;
  template_identity: string;
  status: string;
  inputs: Record<string, unknown>;
  step_executions: Array<{ order: number; agent_id: string; status: string; output_markdown?: string }>;
  step_artifacts: Record<string, Record<string, unknown>>;
  aqua_stub_id: string | null;
  provenance?: RunProvenance;
};

/** Who aggregates around Burin + Pathways in this demo program */
export const AGGREGATION_LAYERS = [
  {
    layer: "Policy & acceptance",
    party: "NE Estuary Collaborative",
    person: "Dr. Sam Okoro",
    role: "funder_program_officer",
    pathway: "Conservation.Program.Register@v1",
    contributes: "Writes what evidence counts; mints trust card for Trust Key verification",
  },
  {
    layer: "Public geometry bootstrap",
    party: "USGS / PAD-US (catalog)",
    person: ", ",
    role: "data_authority",
    pathway: "Conservation.Grant.Award@v1 (boundary bind)",
    contributes: "HUC12 & PAD-US units pre-seeded, no proprietary GIS integration",
  },
  {
    layer: "Grantee organization",
    party: "Hudson Estuary Audubon Chapter",
    person: "Elena Kim",
    role: "chapter_coordinator",
    pathway: "Conservation.Grant.CoordinatorReview@v1",
    contributes: "Aggregates volunteer work; witness-attests quarter completeness",
  },
  {
    layer: "Field production",
    party: "Hudson Estuary Audubon Chapter",
    person: "Maria Reyes",
    role: "field_monitor",
    pathway: "Conservation.Field.EffortSubmit@v1",
    contributes: `Bounded effort proof, transects ${WITHOUT_EXCHANGING}`,
  },
  {
    layer: "Cryptographic substrate",
    party: "Burin kernel",
    person: ",",
    role: "substrate-originator",
    pathway: "Presence.Survey.EffortProof (embedded steps)",
    contributes: "Seals, ZK bounded disclosure, offline verify",
  },
  {
    layer: "Orchestration & IP encoding",
    party: "Pathways / Transect Trust",
    person: ", ",
    role: "pathways-formalization",
    pathway: "Conservation.* templates + PathwayRun graph",
    contributes: "Every action is a licensable pathway; runs link into quarter close",
  },
  {
    layer: "Witness channel (optional)",
    party: "Transect Witness Demo",
    person: ",",
    role: "presence_witness",
    pathway: "Presence.Witness.AppendAttestation (coordinator step)",
    contributes: "Timestamp relay, witness-not-authority",
  },
];

export const PATHWAY_CATALOG = [
  "Conservation.Program.Register@v1",
  "Conservation.Grant.Award@v1",
  "Conservation.Field.EffortSubmit@v1",
  "Conservation.Grant.CoordinatorReview@v1",
  "Conservation.Funder.QuarterVerify@v1",
  "Conservation.Program.QuarterlyClose@v1",
  "Conservation.Trust.CardIssue@v1",
  "Pathways.TrustKey.Issue@v1",
  "Pathways.TrustKey.Verify@v1",
  "Pathways.TrustKey.BuildDimensionalLinks@v1",
  "Pathways.TrustKey.IssueDimensionalLink@v1",
  "Pathways.TrustKey.VerifyDimensionalLink@v1",
];

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  return data;
}

export async function fetchEcosystem(): Promise<Ecosystem> {
  const res = await fetch(`${API}/api/transect-trust/ecosystem`);
  if (!res.ok) throw new Error("Could not load ecosystem state");
  return res.json();
}

export async function registerProgram() {
  return post<{ program: unknown; run: PathwayRunDetail }>("/api/transect-trust/program/register");
}

export async function issueGrantAward(grantId: string) {
  return post<{ grant: Grant; run: PathwayRunDetail }>(`/api/transect-trust/grants/${grantId}/award`);
}

export async function submitFieldEffort(body: {
  grant_id: string;
  monitor_did: string;
  monitor_name: string;
  quarter: string;
  transect_ids: string[];
  polygon_geojson: { type: "Polygon"; coordinates: number[][][] };
  water_observations?: Record<string, unknown>;
}) {
  return post<{ submission: Submission; run: PathwayRunDetail }>("/api/transect-trust/submissions/field", body);
}

export async function reviewSubmission(submissionId: string) {
  return post<{ submission: Submission; run: PathwayRunDetail }>(
    `/api/transect-trust/submissions/${submissionId}/review`
  );
}

export async function verifyQuarter(programId: string, grantId: string, quarter: string) {
  return post<{ verify_run: PathwayRunDetail; verification_passed: boolean }>(
    `/api/transect-trust/programs/${programId}/grants/${grantId}/quarters/${quarter}/verify`
  );
}

export async function closeQuarter(programId: string, quarter: string) {
  return post<{ close: unknown; run: PathwayRunDetail }>(
    `/api/transect-trust/programs/${programId}/quarters/${quarter}/close`
  );
}

export async function fetchRun(runId: string): Promise<PathwayRunDetail> {
  const res = await fetch(`${API}/api/transect-trust/runs/${runId}`);
  if (!res.ok) throw new Error("Run not found");
  return res.json();
}

export async function fetchRunProvenance(runId: string) {
  const res = await fetch(`${API}/api/transect-trust/runs/${runId}/provenance`);
  if (!res.ok) throw new Error("Provenance not found");
  return res.json();
}

export async function fetchTrustStack() {
  const res = await fetch(`${API}/api/transect-trust/trust-stack`);
  if (!res.ok) throw new Error("Could not load trust stack");
  return res.json();
}

export function partyByRole(parties: Party[], role: PartyRole) {
  return parties.find((p) => p.role === role);
}

export function friendlyTemplate(name: string): string {
  const map: Record<string, string> = {
    "Conservation.Program.Register@v1": "Register grant program + trust card",
    "Conservation.Grant.Award@v1": "Award grant → public unit boundary",
    "Conservation.Field.EffortSubmit@v1": "Field monitor bounded effort proof",
    "Conservation.Grant.CoordinatorReview@v1": "Coordinator review + witness",
    "Conservation.Funder.QuarterVerify@v1": "Funder offline quarter verify",
    "Conservation.Program.QuarterlyClose@v1": "Close quarter: issue Trust Key",
    "Conservation.Trust.CardIssue@v1": "Issue printable trust card",
    "Pathways.TrustKey.Issue@v1": "Issue Trust Key (provenance root)",
    "Pathways.TrustKey.Verify@v1": "Verify Trust Key offline",
    "Pathways.TrustKey.BuildDimensionalLinks@v1": "Build Trust Key dimensional link catalog",
    "Pathways.TrustKey.IssueDimensionalLink@v1": "Issue scoped dimensional Trust Key link",
    "Pathways.TrustKey.VerifyDimensionalLink@v1": "Verify dimensional Trust Key link offline",
  };
  return map[name] || name;
}
