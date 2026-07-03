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

export type ApiError = { message: string; detail?: string };

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
    throw new Error(data.detail || data.message || data.error?.message || `Could not create passport (${res.status})`);
  }
  return data;
}

export async function exportBundle(runId: string) {
  const res = await fetch(`${API_BASE}/api/pathways/${runId}/export-bundle`);
  if (!res.ok) throw new Error("Could not download your proof package");
  return res.blob();
}

export async function verifySeal(seal: unknown) {
  const res = await fetch(`${API_BASE}/api/burin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Verification failed");
  return data as { ok: boolean; message?: string };
}

/** Plain-language use cases mapped to pathway templates */
export const USE_CASES = [
  {
    id: "survey",
    title: "Field survey or monitoring",
    subtitle: "Best for conservation, citizen science, or audits",
    example: "“I counted birds in this park without sharing exact nest spots.”",
    templateMatch: "Presence.Survey.EffortProof",
    icon: "🌿",
  },
  {
    id: "visit",
    title: "Site visit or inspection",
    subtitle: "A simple record that you were somewhere at a specific time",
    example: "“I inspected this property on Tuesday — here’s verifiable proof.”",
    templateMatch: "Presence.Field.CaptureSeal",
    icon: "📍",
  },
] as const;

export function friendlyStepLabel(agentId: string, skill?: string): string {
  const map: Record<string, string> = {
    burin_canonicalize: "Mapping your area on an equal-area world grid",
    burin_presence: "Creating your tamper-proof presence seal",
    burin_zk: "Proving survey effort without exposing exact locations",
    burin_export: "Preparing your shareable proof package",
  };
  return map[agentId] || agentId.replace(/_/g, " ");
}
