/** NE Estuary Trust Network: intrinsic + cross-project water reporting demo data */

export type WaterMeasurement = {
  param: string;
  label: string;
  unit: string;
  method?: string;
};

export type PrivateWaterRequest = {
  id: string;
  requesterDid: string;
  requesterName: string;
  requesterOrg: string;
  project: string;
  projectType: "intrinsic" | "cross_project";
  visibility: "private";
  inNetwork: true;
  networkRef: string;
  measurements: WaterMeasurement[];
  note: string;
};

export const ESTUARY_TRUST_NETWORK = {
  id: "nea-estuary-trust-network-v1",
  name: "NE Estuary Trust Network",
  trustCardRef: "nea-estuary-bounded-effort-v1",
  enrolledVia:
    "Parties publish DIDs on the program trust card; private measurement requests are delivered only to in-network field sessions.",
};

export const INTRINSIC_WATER_PANEL = {
  title: "Intrinsic water reporting",
  lead:
    "Estuary field work naturally includes water context at bounded sample points (salinity, temperature, dissolved oxygen, turbidity), sealed to the same Burin coverage root as transect effort, not a separate app.",
  parameters: [
    { param: "salinity_ppt", label: "Salinity", unit: "ppt", method: "Refractometer at surface" },
    { param: "water_temp_c", label: "Water temperature", unit: "°C", method: "Digital probe" },
    { param: "dissolved_o2_mg_l", label: "Dissolved oxygen", unit: "mg/L", method: "Optical DO sensor" },
    { param: "turbidity_ntu", label: "Turbidity", unit: "NTU", method: "Field turbidity tube" },
    { param: "ph", label: "pH", unit: "pH", method: "Calibrated pen" },
  ] as WaterMeasurement[],
};

/** Demo values Maria can attach when submitting field proof */
export const DEMO_INTRINSIC_READINGS: Record<string, string> = {
  salinity_ppt: "12.4",
  water_temp_c: "18.2",
  dissolved_o2_mg_l: "7.1",
  turbidity_ntu: "8.5",
  ph: "7.6",
};

export const PRIVATE_WATER_REQUESTS: PrivateWaterRequest[] = [
  {
    id: "req_nea_quarter_panel",
    requesterDid: "did:transect:nea-estuary-collab",
    requesterName: "Dr. Sam Okoro",
    requesterOrg: "NE Estuary Collaborative",
    project: "NE Estuary Q2 compliance water panel",
    projectType: "intrinsic",
    visibility: "private",
    inNetwork: true,
    networkRef: ESTUARY_TRUST_NETWORK.id,
    measurements: [
      { param: "salinity_ppt", label: "Salinity", unit: "ppt" },
      { param: "dissolved_o2_mg_l", label: "Dissolved oxygen", unit: "mg/L" },
      { param: "turbidity_ntu", label: "Turbidity", unit: "NTU" },
    ],
    note: "Program officer requests standard panel for grant compliance, visible only because NE Estuary Collaborative is on your trust network.",
  },
  {
    id: "req_rutgers_seagrass_do",
    requesterDid: "did:transect:rutgers-seagrass-lab",
    requesterName: "Dr. Priya Nair",
    requesterOrg: "Rutgers Seagrass Lab",
    project: "Hudson seagrass blade health (cross-project DO profile)",
    projectType: "cross_project",
    visibility: "private",
    inNetwork: true,
    networkRef: ESTUARY_TRUST_NETWORK.id,
    measurements: [
      { param: "dissolved_o2_mg_l", label: "Dissolved O₂ (surface)", unit: "mg/L" },
      { param: "dissolved_o2_mg_l_mid", label: "Dissolved O₂ (mid-column)", unit: "mg/L" },
      { param: "water_temp_c", label: "Water temperature", unit: "°C" },
    ],
    note: "Cross-project request: seagrass study overlaps your bounded zone. Rutgers enrolled in the same network, request is private, not broadcast.",
  },
  {
    id: "req_riverkeeper_nitrate",
    requesterDid: "did:transect:hudson-riverkeeper",
    requesterName: "James Ortiz",
    requesterOrg: "Hudson Riverkeeper",
    project: "Mangrove fringe nutrient pulse watch",
    projectType: "cross_project",
    visibility: "private",
    inNetwork: true,
    networkRef: ESTUARY_TRUST_NETWORK.id,
    measurements: [
      { param: "nitrate_mg_l", label: "Nitrate-N", unit: "mg/L", method: "LaMotte dip strip" },
      { param: "salinity_ppt", label: "Salinity", unit: "ppt" },
    ],
    note: "Riverkeeper needs paired nitrate + salinity at mangrove fringe, honored only if you opt in; separate PathwayRun from bird grant.",
  },
  {
    id: "req_community_wrack_ph",
    requesterDid: "did:transect:estuary-mycology-circle",
    requesterName: "Estuary Mycology Circle",
    requesterOrg: "Community fungi wrack survey",
    project: "Wrack-line pH + salinity for fungi habitat index",
    projectType: "cross_project",
    visibility: "private",
    inNetwork: true,
    networkRef: ESTUARY_TRUST_NETWORK.id,
    measurements: [
      { param: "ph", label: "pH at wrack line", unit: "pH" },
      { param: "salinity_ppt", label: "Salinity", unit: "ppt" },
    ],
    note: "Community initiative on the trust network, private ask for cross-domain flora/fauna/fungi + water linkage.",
  },
];

export function buildWaterSubmission(honoredRequestIds: string[]) {
  const honored = PRIVATE_WATER_REQUESTS.filter((r) => honoredRequestIds.includes(r.id));
  return {
    network_ref: ESTUARY_TRUST_NETWORK.id,
    intrinsic_readings: { ...DEMO_INTRINSIC_READINGS },
    honored_private_requests: honored.map((r) => ({
      request_id: r.id,
      requester_did: r.requesterDid,
      requester_org: r.requesterOrg,
      project: r.project,
      project_type: r.projectType,
      measurement_params: r.measurements.map((m) => m.param),
    })),
  };
}
