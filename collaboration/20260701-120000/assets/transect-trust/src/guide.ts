import type { Ecosystem } from "./api";
import { WITHOUT_EXCHANGING } from "./content/privacyFloor";

export type GuideStepId =
  | "program_rules"
  | "grant_award"
  | "field_submit"
  | "coordinator_review"
  | "funder_verify"
  | "quarter_close";

export type GuideStep = {
  id: GuideStepId;
  order: number;
  phase: string;
  who: { name: string; shortName: string; role: string; organization: string };
  accomplishing: string;
  whyItMatters: string;
  yourAction: string;
  buttonLabel: string;
  buttonLabelDone: string;
  whatHappensNext: string;
  waitingMessage?: string;
  dev: {
    pathway: string;
    api: string;
    edgeRole: string;
    agents?: string[];
    actorAccountId: string;
  };
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "program_rules",
    order: 1,
    phase: "Set the rules",
    who: {
      name: "Dr. Sam Okoro",
      shortName: "Sam",
      role: "Grant program officer",
      organization: "NE Estuary Collaborative",
    },
    accomplishing:
      "Publish what counts as acceptable field proof for this grant program, and register which cross-initiative templates (seagrass, mangrove, fungi) may privately match overlapping field sessions.",
    whyItMatters:
      "Without written acceptance rules, every chapter argues about screenshots vs. GPS vs. honor-system reports. Sam defines the standard once.",
    yourAction:
      "Register the NE Estuary Transect Monitoring program and issue the trust card verifiers will use to check Trust Keys.",
    buttonLabel: "Publish program rules",
    buttonLabelDone: "Program rules published",
    whatHappensNext: "Sam can award Maria's chapter a grant tied to a public estuary unit (marsh, seagrass, or mangrove fringe).",
    dev: {
      pathway: "Conservation.Program.Register@v1",
      api: "POST /api/transect-trust/program/register",
      edgeRole: "program_registration",
      agents: ["conservation_program", "burin_export"],
      actorAccountId: "party_funder_nea",
    },
  },
  {
    id: "grant_award",
    order: 2,
    phase: "Award the grant",
    who: {
      name: "Dr. Sam Okoro",
      shortName: "Sam",
      role: "Grant program officer",
      organization: "NE Estuary Collaborative",
    },
    accomplishing:
      "Officially fund Hudson Estuary Audubon to monitor Piermont Marsh and adjacent estuary units, bound to the public watershed, not arbitrary map pins.",
    whyItMatters:
      "The award links dollars to a USGS HUC unit everyone can see. Maria's later proof must fall inside that unit.",
    yourAction: "Award the chapter grant for transect monitoring at Piermont Marsh (HUC02020006).",
    buttonLabel: "Award chapter grant",
    buttonLabelDone: "Grant awarded",
    whatHappensNext: "Maria can submit proof that she walked transects B and C this quarter.",
    dev: {
      pathway: "Conservation.Grant.Award@v1",
      api: "POST /api/transect-trust/grants/{grant_id}/award",
      edgeRole: "grant_award",
      agents: ["burin_canonicalize", "burin_presence", "conservation_grant"],
      actorAccountId: "party_funder_nea",
    },
  },
  {
    id: "field_submit",
    order: 3,
    phase: "Prove the fieldwork",
    who: {
      name: "Maria Reyes",
      shortName: "Maria",
      role: "Community field monitor",
      organization: "Hudson Estuary Audubon Chapter",
    },
    accomplishing:
      `Show she actually walked transects B and C ${WITHOUT_EXCHANGING}. Record intrinsic water readings and optionally honor private in-network measurement requests from cross-project parties.`,
    whyItMatters:
      "Renewal is at risk if she only sends 'trust me.' This file proves effort in the marsh zone plus water context, cross-project asks from network-enrolled funders and researchers appear only to her until she opts in.",
    yourAction:
      "Mark where you worked on the map, review private water requests from in-network parties, then submit your quarter proof.",
    buttonLabel: "Submit my field proof",
    buttonLabelDone: "Field proof submitted",
    whatHappensNext: "Elena Kim (chapter coordinator) reviews before anything goes to the funder.",
    dev: {
      pathway: "Conservation.Field.EffortSubmit@v1",
      api: "POST /api/transect-trust/submissions/field",
      edgeRole: "field_effort_submission",
      agents: ["conservation_field", "burin_canonicalize", "burin_presence", "burin_zk"],
      actorAccountId: "party_monitor_maria",
    },
  },
  {
    id: "coordinator_review",
    order: 4,
    phase: "Chapter sign-off",
    who: {
      name: "Elena Kim",
      shortName: "Elena",
      role: "Chapter coordinator",
      organization: "Hudson Estuary Audubon Chapter",
    },
    accomplishing:
      "Confirm Maria's submission is complete for Q2 and vouch that the chapter stands behind it before the funder opens it.",
    whyItMatters:
      "The funder doesn't want to chase individual volunteers. Elena aggregates and attests on behalf of the chapter.",
    yourAction: "Review Maria's transect submission and approve it for funder review.",
    buttonLabel: "Approve for funder",
    buttonLabelDone: "Approved for funder",
    whatHappensNext: "Sam Okoro verifies the quarter Trust Key offline, on her own laptop.",
    waitingMessage: "Waiting for Maria to submit her field proof for this quarter.",
    dev: {
      pathway: "Conservation.Grant.CoordinatorReview@v1",
      api: "POST /api/transect-trust/submissions/{id}/review",
      edgeRole: "coordinator_review",
      agents: ["burin_presence", "conservation_grant"],
      actorAccountId: "party_coord_elena",
    },
  },
  {
    id: "funder_verify",
    order: 5,
    phase: "Funder checks proof",
    who: {
      name: "Dr. Sam Okoro",
      shortName: "Sam",
      role: "Grant program officer",
      organization: "NE Estuary Collaborative",
    },
    accomplishing:
      "Independently verify Maria's effort proof meets the program rules, without calling her or logging into a vendor portal.",
    whyItMatters:
      "Sam is the relying party. She only releases renewal funds if the Trust Key checks out against the trust card she published in step 1.",
    yourAction: "Verify the Q2 Trust Key for Piermont Marsh monitoring.",
    buttonLabel: "Verify quarter proof",
    buttonLabelDone: "Quarter verified",
    whatHappensNext: "Sam seals the quarter and issues the Trust Key for the program archive and renewal record.",
    waitingMessage: "Waiting for Elena to approve Maria's submission.",
    dev: {
      pathway: "Conservation.Funder.QuarterVerify@v1 (+ Pathways.TrustKey.Verify@v1)",
      api: "POST /api/transect-trust/programs/.../quarters/{q}/verify",
      edgeRole: "funder_quarter_verify",
      agents: ["conservation_funder", "application", "pathways_trustkey"],
      actorAccountId: "party_funder_nea",
    },
  },
  {
    id: "quarter_close",
    order: 6,
    phase: "Close the quarter",
    who: {
      name: "Dr. Sam Okoro",
      shortName: "Sam",
      role: "Grant program officer",
      organization: "NE Estuary Collaborative",
    },
    accomplishing:
      "Archive everything that happened this quarter (program rules, award, field proof, chapter sign-off, verification) in one Trust Key.",
    whyItMatters:
      "Next year's audit or renewal can reconstruct the full story from cryptographic provenance, without re-assembling emails and spreadsheets.",
    yourAction: "Close Q2 and issue the Trust Key.",
    buttonLabel: "Close quarter & issue Trust Key",
    buttonLabelDone: "Quarter closed",
    whatHappensNext: "Q2 is complete. The chapter can begin the next reporting period.",
    waitingMessage: "Waiting for Sam to verify the quarter first.",
    dev: {
      pathway:
        "Pathways.TrustKey.Issue@v1 → Pathways.TrustKey.VerifyDimensionalLink@v1 → Pathways.TrustKey.IssueDimensionalLink@v1 → Conservation.Program.QuarterlyClose@v1",
      api: "POST /api/transect-trust/programs/.../quarters/{q}/close",
      edgeRole: "quarterly_close (+ trust_key_issue, trust_key_verify_dimensional, trust_key_issue_dimensional)",
      agents: ["conservation_program", "pathways_trustkey", "burin_export"],
      actorAccountId: "party_funder_nea",
    },
  },
];

export const QUARTER = "2026-Q2";
export const DEMO_GRANT = "grant_maria_piermont_2026";

export function runSucceeded(eco: Ecosystem, runId: string | null | undefined): boolean {
  if (!runId) return false;
  const run = eco.conservation_runs.find((r) => r.id === runId);
  return run?.status === "COMPLETED";
}

export function getStepStatus(
  stepId: GuideStepId,
  eco: Ecosystem
): "complete" | "current" | "waiting" | "upcoming" {
  const grant = eco.grants.find((g) => g.id === DEMO_GRANT);
  const submission = eco.submissions.find((s) => s.grant_id === DEMO_GRANT && s.quarter === QUARTER);
  const close = eco.quarter_closes.find((c) => c.quarter === QUARTER);

  const done: Record<GuideStepId, boolean> = {
    program_rules: runSucceeded(eco, eco.program?.program_run_id),
    grant_award: runSucceeded(eco, grant?.award_run_id),
    field_submit: runSucceeded(eco, submission?.field_run_id),
    coordinator_review: runSucceeded(eco, submission?.review_run_id),
    funder_verify: runSucceeded(eco, close?.verify_run_id),
    quarter_close: runSucceeded(eco, close?.close_run_id),
  };

  if (done[stepId]) return "complete";

  const order: GuideStepId[] = [
    "program_rules",
    "grant_award",
    "field_submit",
    "coordinator_review",
    "funder_verify",
    "quarter_close",
  ];
  const firstIncomplete = order.find((id) => !done[id]);
  if (stepId === firstIncomplete) return "current";

  const stepIdx = order.indexOf(stepId);
  const currentIdx = order.indexOf(firstIncomplete!);
  if (stepIdx < currentIdx) return "complete";
  if (stepIdx === currentIdx + 1 && stepId === "coordinator_review" && !submission?.field_run_id)
    return "waiting";
  return "upcoming";
}

export function getCurrentStepId(eco: Ecosystem): GuideStepId | "all_complete" {
  for (const step of GUIDE_STEPS) {
    const s = getStepStatus(step.id, eco);
    if (s === "current" || s === "waiting") return step.id;
  }
  return "all_complete";
}

export function getRunIdForStep(stepId: GuideStepId, eco: Ecosystem): string | null {
  const grant = eco.grants.find((g) => g.id === DEMO_GRANT);
  const submission = eco.submissions.find((s) => s.grant_id === DEMO_GRANT && s.quarter === QUARTER);
  const close = eco.quarter_closes.find((c) => c.quarter === QUARTER);
  switch (stepId) {
    case "program_rules":
      return eco.program?.program_run_id ?? null;
    case "grant_award":
      return grant?.award_run_id ?? null;
    case "field_submit":
      return submission?.field_run_id ?? null;
    case "coordinator_review":
      return submission?.review_run_id ?? null;
    case "funder_verify":
      return close?.verify_run_id ?? null;
    case "quarter_close":
      return close?.close_run_id ?? null;
  }
}
