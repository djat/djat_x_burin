/** Overview page content: institutional and community audiences, honest technical boundaries */

import {
  NO_GPS_OR_IDENTIFIABLE,
  PRIVACY_NEVER_EXCHANGED,
  WITHOUT_EXCHANGING,
  WITHOUT_HANDING_ANYONE,
} from "./privacyFloor";

export const OVERVIEW = {
  headline: "One field session, many habitats: discover collaboration without exposing sensitive local detail",
  subhead:
    `Transect Trust shows how a monitor walking marsh, seagrass, or mangrove transects can satisfy one grant’s proof requirements while privately learning whether another project overlaps, and how intrinsic water reporting plus in-network measurement requests flow across projects ${WITHOUT_HANDING_ANYONE}.`,

  stackPreview: {
    title: "The stack behind this demo",
    intro:
      "Transect Trust is a reference application and ecosystem seed, not a standalone product. It shows what becomes possible when two open substrates are composed for real institutional and community field work.",
    burin: {
      name: "Burin",
      tagline: "Accountability without agreement",
      body:
        `Burin is a spatiotemporal trust substrate for where-and-when claims, broader than any single use case. Witnesses relay and timestamp rather than rule; fraud is locally provable, with no blockchain consensus and no platform holding your seals hostage. In this demo it supports disconnected field work on an equal-area grid (rHEALPix), offline verification without a live server, and bounded disclosure to prove effort inside a public watershed unit ${WITHOUT_EXCHANGING}.`,
      highlights: [
        "Offline-verifiable presence seals",
        "Bounded disclosure at HUC/PAD-US unit floor",
        "Witness-not-authority relay; fraud proofs when witnesses lie",
      ],
    },
    pathways: {
      name: "Pathways",
      tagline: "Orchestration without a broker",
      body:
        "Pathways is an orchestration substrate for multi-step work, broader than any single application. Workflows become named, versioned, forkable templates: first-class intellectual property with input/output contracts, gate profiles for non-delegable human approvals, and license terms that travel with every copy. Each action launches a PathwayRun that records every step, agent, and artifact in a linked run graph; credit and lineage survive forks, and peers selectively adopt improvements without a central marketplace broker. Transect Trust applies it here, chaining Conservation.* templates from program registration through quarter close.",
      highlights: [
        "Named templates: credit, lineage, and licensing travel with the work",
        "PathwayRun audit trail and run-graph linkage",
        "Fork, attribute, and merge without a platform broker",
      ],
    },
    trustKey: {
      name: "Trust Key",
      tagline: "Provenance root without platform hostage",
      body:
        "A Pathways technique: a cryptographic provenance root for any multi-party context. A Trust Key always opens back, by deep link, into the full collaborative context from which it originated — every PathwayRun, Burin seal, party attestation, and step artifact. Pass additional query parameters to slice into any registry dimension (composite domain, context lens, capability, habitat, grant, quarter, run role, location, time, temperature). The same root key can also mint one-time dimensional links that burn after first offline verify. Entirely private, multi-signature capable, and offline verifiable without the platform that produced it.",
      technique: "Pathways.TrustKey.Issue@v1",
      verifyTechnique: "Pathways.TrustKey.Verify@v1",
      pattern: "Pattern.TrustKey.ProvenanceKey",
      authors: [
        { name: "DJ Thomson", role: "co-author" },
        { name: "Cameron Sajedi", role: "co-author" },
      ],
      uniqueAspects: [
        "Provenance root key (one portable root, not a single step output)",
        "Deep link back into originating collaborative context",
        "Dual plane: orchestration (Pathways) + presence (Burin), no merged super-hash",
        "Entirely private distribution",
        "Multi-signature capable envelope",
        "Offline verifiable without issuer platform or vendor login",
        "Hash-linked cross-reference only (no silent artifact merge)",
        "Portable relying-party verification (powerful party does the least)",
        "Dimensional context parameters — slice by any registry facet without re-minting",
        "One-time dimensional links from the same root key (burn after first verify)",
      ],
      dimensionParams:
        "composite_domain · context_lens · capability · agent_role · quarter · program_id · grant_id · habitat · unit_id · run_role · run_id · location · time · temperature",
      dimensionLinkExamples: [
        {
          label: "Full quarter program context",
          oneTime: false,
          params: "program_id=nea-estuary-transect-2026&quarter=2026-Q2&composite_domain=Conservation",
          note: "Program officer archive — all Conservation runs for the reporting quarter.",
        },
        {
          label: "Marsh bird grant — bounded effort slice",
          oneTime: false,
          params:
            "composite_domain=Conservation&capability=bounded-disclosure-effort&habitat=marsh&grant_id=grant_maria_bird_2026",
          note: "Maria’s primary grant proof; fauna / marsh habitat only.",
        },
        {
          label: "Seagrass opt-in sibling run",
          oneTime: true,
          params:
            "composite_domain=Seagrass&context_lens=estuary-transect&capability=cross-initiative-discovery&one_time=1&nonce=a3f9c2e1",
          note: "Cross-initiative discovery match — private to monitor until opt-in; burns after first verify.",
        },
        {
          label: "Water panel fulfillment (Rutgers DO)",
          oneTime: true,
          params:
            "context_lens=estuary-transect&capability=water-panel-fulfillment&agent_role=field_monitor&location=unit_huc_02040301&time=2026-Q2&temperature=12-18C&one_time=1&nonce=b7e4d801",
          note: "In-network dissolved-oxygen request — bounded by location, time, and temperature on the same walk.",
        },
        {
          label: "Mangrove restoration verification",
          oneTime: false,
          params: "composite_domain=Mangrove&habitat=mangrove&capability=bounded-disclosure-effort",
          note: "Shoreline plot overlap — different funder, same bounded session.",
        },
        {
          label: "Coordinator witness attestation",
          oneTime: true,
          params: "run_role=coordinator_review&agent_role=chapter_coordinator&quarter=2026-Q2&one_time=1&nonce=c1ab9f44",
          note: "Single run_role slice for fraud-check audit — one-time key.",
        },
      ],
    },
    together: {
      title: "Brought together here for the first time",
      lead:
        "No production system has chained Burin presence, Pathways orchestration, and a Trust Key provenance root through a full multi-party quarter — with offline relying-party verification and dimensional deep links.",
      compositionTitle: "Stack composition",
      points: [
        {
          label: "Dual attestation",
          detail:
            "Two planes, one context. Pathways attests orchestration: which workflow ran, under which template rules, with what lineage. Burin attests presence: that sealed artifacts are intact and offline-checkable at bounded resolution. The planes cross-reference by hash only — neither alone is sufficient.",
        },
        {
          label: "Sibling PathwayRuns",
          detail:
            "Each distinct workflow slice is its own PathwayRun in a linked graph — not one merged row or super-hash. Primary work, opt-in collaborations, and cross-party requests stay separate artifacts with hash-linked cross-references.",
        },
        {
          label: "Trust Key verification",
          detail:
            "A portable provenance root with dimensional deep links. The relying party verifies offline against a trust card, accepts or rejects the scoped slice, and follows links only if more detail is needed — no vendor login, no platform hostage.",
        },
      ],
      exampleTitle: "In practice: one estuary quarter",
      exampleBody:
        `Maria walks marsh transects for her primary grant. That session seals one PathwayRun; optional seagrass or mangrove opt-ins and honored in-network water requests each spawn sibling runs on the same walk — dual attestation and sibling linkage in action. At quarter close Sam receives a Trust Key, verifies offline on her laptop, and opens dimensional deep links only if the audit needs more than the scoped slice. ${NO_GPS_OR_IDENTIFIABLE}`,
      inThisDemo:
        "This demo encodes Conservation.* quarter templates plus Pathways.TrustKey.* (Issue, Verify, BuildDimensionalLinks, IssueDimensionalLink, VerifyDimensionalLink) as first-class PathwayRuns linked in the run graph, seeds a six-role estuary quarter (2026-Q2), and wires every button to a real PathwayRun. Developer context shows the honest boundaries: shared demo signer, stub ZK, narrated cross-initiative discovery.",
    },
  },

  waterReporting: {
    title: "Water reporting: intrinsic and cross-project",
    lead:
      "Water quality is not a bolt-on spreadsheet. Salinity, dissolved oxygen, turbidity, and pH attach naturally to bounded estuary field sessions. Institutional funders, seagrass labs, Riverkeeper programs, and community initiatives on the same trust network can issue private requests for specific measurements, honored only when the monitor opts in, sealed to the same coverage root.",
    networkGate:
      "Private requests are visible because the requester’s DID is enrolled on the NE Estuary Trust Network (program trust card). Off-network parties never see the ask.",
    crossProject:
      `Cross-project water reporting spawns sibling PathwayRuns: Maria’s bird grant proof stays separate; Rutgers DO profile or Riverkeeper nitrate panel links ${WITHOUT_EXCHANGING}.`,
  },

  centerpiece: {
    title: "Cross-session collaboration: the capability at the center",
    lead:
      "Field work is expensive. Monitors often pass through zones where multiple programs care about different taxa and habitats. Today each app silos you into one survey. Transect Trust treats every field session as a potential bridge: bounded presence proof for your primary grant, plus private discovery of adjacent opportunities you may opt into.",
    habitats: [
      {
        name: "Marsh",
        example: "Bird transects and nest-adjacent monitoring stay with the chapter; nothing identifiable crosses project boundaries.",
      },
      {
        name: "Seagrass",
        example: "Subtidal bed health, blade density, epiphyte loads, often the same estuary edge Maria already walks.",
      },
      {
        name: "Mangrove",
        example: "Restoration plots, seedling survival, shoreline stabilization, overlapping public units, different funders.",
      },
    ],
    domains: {
      title: "Flora, fauna, fungi, and water on one shoreline",
      body:
        "A marsh bird grant cares about fauna. A seagrass lab cares about flora and dissolved oxygen. A mycology initiative cares about fungi on wrack lines, often paired with pH and salinity. Each has its own Pathway template and institutional acceptance rules, but the same bounded field session can carry intrinsic water readings and honor private in-network measurement requests without merging sensitive datasets.",
    },
    howItWorks: [
      {
        step: "Primary session sealed",
        detail:
          `Maria submits effort proof for her Audubon marsh transect plus intrinsic water panel (salinity, DO, turbidity). Burin seals zone coverage at public-unit resolution ${WITHOUT_EXCHANGING}.`,
      },
      {
        step: "Private overlap discovery",
        detail:
          "While participating, her client checks registered initiatives whose acceptance zones intersect her bounded work area on the Burin plane, then narrows candidates through Pathways’ multi-dimensional query architecture: registry affiliations tag each template by composite domain (Conservation, seagrass, mangrove), context lens, abstract capability (bounded-disclosure effort, water panel fulfillment), and agent role. Facets intersect with AND logic, so Maria sees only initiatives that fit her zone and her session, not every template in the catalog. Matches are shown only to her: seagrass NDVI pilot, mangrove planting verification, fungi plot resurvey, each with optional private water measurement asks from in-network parties.",
      },
      {
        step: "Honor private measurement requests",
        detail:
          `Network-enrolled requesters (funder compliance panel, Rutgers seagrass DO profile, Riverkeeper nitrate) send specific measurement asks visible only in-network. Maria opts in per request; readings seal to the same Burin root ${WITHOUT_EXCHANGING}.`,
      },
      {
        step: "Opt-in, separate PathwayRuns",
        detail:
          "If Maria accepts a cross-project opportunity, a linked PathwayRun starts under that initiative’s template. Primary grant proof and water observations stay intact; cross-domain reporting is additive, auditable, and never auto-merged.",
      },
      {
        step: "Institutional and community benefit",
        detail:
          "Funders get verifiable effort and water context without duplicate site visits. Community monitors do more science per mile. Researchers gain recruitment and specific measurements without publishing recruitment coordinates, personal data, or species tied to location.",
      },
    ],
    example:
      "Maria walks Piermont Marsh for Q2 bird monitoring and records intrinsic salinity (12.4 ppt) and DO (7.1 mg/L). Privately surfaced: Sam’s compliance water panel (in-network), Rutgers seagrass DO profile (cross-project), Riverkeeper mangrove nitrate watch. She honors Sam’s panel and Rutgers DO only; her bird proof goes to Elena unchanged; water readings link via sibling PathwayRuns.",
    honestNote:
      "This demo illustrates discovery and linkage in the developer overlay; production matching would require initiative registries, consent UX, and per-program acceptance policies, not implemented end-to-end here.",
  },

  whatsSpecial: {
    title: "What is special about this application",
    points: [
      {
        title: "Intrinsic & cross-project water reporting",
        body: `Salinity, DO, turbidity, and pH attach to every estuary session. In-network parties privately request specific measurements; monitors opt in per ask, cross-project water data ${WITHOUT_EXCHANGING}.`,
      },
      {
        title: "Cross-session collaboration (centerpiece)",
        body: `While proving effort for one grant, field monitors can privately discover overlapping projects, seagrass, mangrove, fungi, other fauna studies, and opt into additional PathwayRuns ${WITHOUT_EXCHANGING}.`,
      },
      {
        title: "Multi-party, not single-user",
        body: "Most location apps prove one person was somewhere. This demo shows six coordinated roles (institutional funder, grantee community chapter, coordinator, field monitor, public map data, and an independent verifier), each with a distinct job in the same quarter.",
      },
      {
        title: "Privacy and proof at the same time",
        body: `Maria proves she covered the transect zone across marsh, seagrass, or mangrove units. The funder verifies it offline. ${NO_GPS_OR_IDENTIFIABLE}`,
      },
      {
        title: "Public data bootstraps trust",
        body: "Grants bind to USGS watershed units and protected-area catalogs everyone already uses, not proprietary GIS locked inside one vendor.",
      },
      {
        title: "Every action is auditable",
        body: "Each step creates a permanent record of who did what, when, and under which rules, linked together for quarterly archive, including any opt-in cross-initiative runs.",
      },
      {
        title: "Developer mode shows the honest stack",
        body: "Turn on Developer context to see exactly which devices, datasets, account IDs, and trust assumptions sit underneath each proof, including what this demo does not yet guarantee.",
      },
    ],
  },

  firstTimeDemo: {
    title: "What this demonstrates for the first time",
    intro:
      "No production product today combines all of the following in one quarter-close workflow. This demo is a reference implementation, not a certified compliance system.",
    items: [
      {
        claim: "Private in-network water measurement requests honored on opt-in",
        detail:
          `Institutional and community parties enrolled on the program trust network can request specific water measurements during an active field session. Requests are private to in-network monitors; readings seal to the same bounded Burin root as transect effort, cross-project ${WITHOUT_EXCHANGING}.`,
        contrast:
          "Water-quality apps and grant portals treat water as separate forms; they do not route private cross-project measurement asks to monitors already in-zone on a shared trust network.",
      },
      {
        claim: "Private cross-initiative discovery during an active field session",
        detail:
          "While sealing bounded effort for one grant, the monitor can learn, without public broadcast, whether seagrass, mangrove, fungi, or other studies overlap her work zone on the Burin plane and match her session on Pathways registry facets (capability, domain, lens), inviting opt-in participation via separate PathwayRuns.",
        contrast:
          "Citizen-science platforms route you into one survey at a time; they do not privately match overlapping institutional and community initiatives at a public unit floor.",
      },
      {
        claim: "Bounded-disclosure field effort at a public unit floor",
        detail:
          `Prove “≥ K survey cells in this HUC watershed unit” across marsh, seagrass, or mangrove boundaries, ${WITHOUT_EXCHANGING}, verifiable by a third party with only a Trust Key and a trust card.`,
        contrast: "eBird/iNaturalist obscure on-platform; they do not issue portable offline proofs for external funders.",
      },
      {
        claim: "Multi-party grant workflow encoded as licensable Pathways",
        detail:
          "Seven Conservation.* templates chain funder registration → grant award → field submit → chapter review → funder verify → quarter close. Each launch is a PathwayRun with linked provenance; cross-initiative opt-ins add sibling runs without merging artifacts.",
        contrast: "Typical grant portals store PDFs; they do not cryptographically link orchestration to presence.",
      },
      {
        claim: "Dual attestation without a central broker",
        detail:
          "Orchestration plane (what workflow ran) and presence plane (where/when sealed) export together, verifiable offline, no merged super-hash, no blockchain consensus.",
        contrast: "EVV and platform check-ins require vendor login; proofs do not travel independently.",
      },
      {
        claim: "Trust card + practice-profile cold start",
        detail:
          "The institutional funder publishes witness keys and acceptance rules up front, parallel to how Pathways practice profiles bootstrap institutional trust before any field work.",
        contrast: "Most systems assume trust after the fact (“trust our dashboard”).",
      },
    ],
    honestLimit:
      "This demo uses a shared backend signing key, stub ZK proofs, and server clock, not per-device GPS witnesses or satellite relay. Cross-initiative discovery is narrated and partially wired in developer context; it proves record integrity and agreed workflow, not that species exist or Maria was physically on site.",
  },

  audiences: {
    title: "Who this matters to most",
    intro:
      "Every grant quarter has two sides: institutional relying parties who accept proof, and community organizations that produce it in the field, often across marsh, seagrass, and mangrove in a single estuary.",
    institutional: {
      label: "Institutional",
      parties: [
        {
          who: "Grant program officers & funders",
          org: "NE Estuary Collaborative, foundations, federal pass-through programs",
          why: `Accept quarterly effort proof without phone calls, ${WITHOUT_EXCHANGING}, and without trusting a single vendor dashboard, while adjacent initiatives can recruit overlap without duplicate site visits.`,
        },
        {
          who: "Water quality & estuary monitoring programs",
          org: "Riverkeeper, EPA pass-through, state estuary programs",
          why: "Request specific measurements privately from monitors already in overlapping units, cross-project nutrient and salinity panels without a second field trip.",
        },
        {
          who: "Cross-domain research leads",
          org: "Seagrass labs, mangrove restoration programs, mycology surveys",
          why: `Discover monitors already doing bounded work in overlapping units, recruit for flora, fauna, or fungi protocols ${WITHOUT_EXCHANGING}.`,
        },
        {
          who: "Regulators & auditors",
          org: "Agencies that write acceptance into grant terms",
          why: "A concrete file format and verification story to reference when updating reporting requirements, adoption is policy, not automatic.",
        },
        {
          who: "Pathways implementers & integrators",
          org: "Workflow engine builders, legal/compliance product teams",
          why: "Reference multi-party template IP, royalty_split licensing, run-graph patterns, and cross-initiative linkage for field-evidence domains.",
        },
        {
          who: "Burin substrate adopters",
          org: "Witness channels, device makers, offline-first field tools",
          why: "See presence seals embedded inside real orchestration, not as a standalone crypto demo.",
        },
        {
          who: "Researchers & journal reviewers",
          org: "Ecology, reproducibility-minded editors",
          why: `A path toward proving sampling effort wasn’t cherry-picked across taxa and habitats ${WITHOUT_EXCHANGING}.`,
        },
      ],
    },
    community: {
      label: "Community",
      parties: [
        {
          who: "Community chapters & field monitors",
          org: "Audubon chapters, watershed groups, estuary community science programs",
          why: "Satisfy one grant’s renewal while privately discovering seagrass, mangrove, or fungi opportunities on the same walk, coordinators aggregate, community members submit once per primary proof.",
        },
        {
          who: "Chapter coordinators",
          org: "Local leads who sign off before reports reach funders",
          why: "One accountable voice for the chapter instead of the funder chasing individual monitors, including visibility into any opt-in cross-initiative runs.",
        },
        {
          who: "Community conservation organizations",
          org: "Grantee land trusts, watershed alliances, local NGOs",
          why: "Reuse public unit boundaries (HUC, PAD-US) across marsh, seagrass, and mangrove so every grant speaks the same geographic language as institutional funders.",
        },
      ],
    },
  },

  technology: {
    title: "The technology: institutional and community context",
    intro:
      `Two open building blocks work together: Burin answers “was this field record tampered with, and where/when was it sealed?” Pathways answers “which institutional workflow ran, under what rules, with what lineage?” Cross-session collaboration works because both layers share a public unit floor. Overlap is not only spatial: Burin compares bounded unit sets on the presence plane; Pathways extends it across registry dimensions (composite domain, context lens, abstract capability, agent role). Templates carry those facets via pathway_domain_affiliation, and list queries intersect lens, composite_domain, and capability filters with AND logic, so a monitor can match initiatives that fit geographically and semantically, privately, without exchanging ${PRIVACY_NEVER_EXCHANGED}.`,

    burin: {
      name: "Burin",
      tagline: "Accountability without agreement",
      paragraphs: [
        "Burin is a spatiotemporal trust substrate, a notary for where-and-when claims wherever parties need accountability without agreement. Witnesses relay and timestamp; their mistakes are locally provable. Its scope is broader than conservation or field work; Transect Trust applies it here to disconnected estuary monitoring.",
        "It uses an equal-area grid (rHEALPix) so ‘within this marsh, seagrass, or mangrove unit’ is a precise mathematical statement, not a vague pin on a map.",
        "Proofs can shrink to something you read over a radio or print on paper, the same seal verifies offline on a laptop with no server.",
        "Bounded cells are what enable private overlap discovery on the presence plane: initiatives compare unit sets, not trajectories. Pathways adds orthogonal overlap on the orchestration plane, registry-tagged templates filtered by capability and domain, so Maria’s nest-adjacent work stays private while seagrass programs learn she was in-zone and which workflows she could opt into, with no identifiable exchange across projects.",
        "Burin deliberately does not pick a winner: witnesses relay and timestamp; their mistakes are detectable. No blockchain, no central authority holding your data hostage.",
      ],
      powers: [
        "Offline-verifiable seals",
        "Bounded disclosure (prove effort zone, hide fine cells)",
        "Cross-initiative overlap: spatial (Burin unit floor) + registry facets (Pathways query)",
        "In-network private measurement routing",
        "Degrade-to-paper (24-word spoken seal)",
        "Fraud proofs when a witness equivocates",
      ],
    },

    pathways: {
      name: "Pathways",
      tagline: "Orchestration without a broker",
      paragraphs: [
        "Pathways is an orchestration substrate for multi-step work: versioned, addressable recipes scoped by domain, not anonymous scripts buried in ad-hoc services. Like a signed recipe with a permanent family tree, each template carries a name, authorship, ordered steps, and terms that travel with every copy.",
        "Each run records every step, agent, and artifact. Lineage travels with exports (Aqua attestations in full deployments); forks remember their ancestors, and stripping attribution is itself a visible act.",
        "Overlap checks extend beyond geography. Template discovery filters through pathway_domain_affiliation: composite domain, context lens, and abstract capability intersect with AND logic (lens, composite_domain, capability query params), so a monitor in-zone can surface sibling workflows that share the same capability or acceptance profile without scanning the whole catalog.",
        "Cross-initiative opt-ins spawn sibling PathwayRuns linked in the run graph, bird grant proof and seagrass study participation stay separate artifacts with shared bounded presence.",
        "License terms ride on templates: substrate originators, pathway authors, and channel partners can share revenue without hiding the kernel.",
        "Gate profiles express who must approve what, the ‘non-delegable’ human checkpoints institutional funders actually care about.",
      ],
      powers: [
        "PathwayRun audit trail",
        "Cross-session run linkage (primary + opt-in)",
        "Private water request fulfillment per network DID",
        "Multi-party template licensing",
        "Practice profiles & trust cards as cold-start",
        "Composable agents (field, legal, presence, export)",
      ],
    },

    together: {
      title: "Why Burin + Pathways together is profoundly powerful",
      paragraphs: [
        "Alone, Burin gives you a seal, but not the story of which grant program, which quarter, or which coordinator approved it.",
        "Alone, Pathways gives you workflow provenance, but not cryptographic proof that field effort happened in the agreed zone without oversharing location.",
        "Together they form dual attestation: the orchestration plane says this multi-party process ran correctly; the presence plane says the field commitment is intact and checkable.",
        "That combination is what lets an institutional funder in Trenton verify Maria’s marsh work on a plane to Seattle, with a Trust Key from the community chapter that deep-links back into the full quarter context, not access to anyone’s app.",
        "The same stack lets a seagrass researcher privately request dissolved-oxygen readings from monitors already in-zone; flora, fauna, fungi, and water on one shoreline, one walk, many PathwayRuns.",
        "And because both export without requiring a live platform, the powerful institutional party is asked to do the least: accept a Trust Key, verify offline, follow the deep link only if needed.",
      ],
      analogy:
        "Burin is the wax seal on the envelope. Pathways is the signed cover sheet listing every handler who touched it, and every optional add-on study Maria opted into. Transect Trust closes the quarter with a Trust Key: private, multi-sig, offline verifiable provenance that always opens back into the collaborative context it came from.",
    },
  },

  cta: {
    title: "Try the quarter workflow",
    body: "Walk through Q2 2026 with Sam, Maria, and Elena: six steps from program rules to a quarter-close Trust Key, with cross-habitat collaboration woven through the field session.",
    button: "Start quarter workflow →",
  },
};
