// path: src/data/process_lcm.ts

export const PROCESS_LCM6 = {
  novaApps: [],
  processData: {
    name: "Type Process Demo 6 - LCM",
    description: "Demo process created via script",
    documentationUrl: "https://example.com",
    lifecycle: "LIVE",
  },
  milestones: [
    { name: "M0 Start", description: "Project start milestone" },
    { name: "M1 Planning", description: "Planning milestone" },
    { name: "M2 Design Approved", description: "System design approved" },
    { name: "M3 Prototype Ready", description: "Prototype ready" },
    { name: "M4 Testing Completed", description: "Testing completed" },
    { name: "M5 Validation & Release", description: "Validation and release" },
    { name: "M6 Final Test Readiness", description: "Final test readiness" },
    { name: "M7 Project Closure", description: "Project closure" },
    {
      name: "M8 Audit & Archive",
      description: "Post-closure audit and archiving",
    },
    { name: "Subflow Review", description: "Subflow review" },
    { name: "Parallel Start", description: "Parallel start milestone" },
    { name: "Parallel Mid", description: "Parallel mid milestone" },
  ],
  map: {
    Initiation: ["M0 Start", "M1 Planning"],
    Planning: ["M1 Planning", "M2 Design Approved"],
    "System Design": ["M2 Design Approved", "M3 Prototype Ready"],
    "Prototype Build": ["M3 Prototype Ready", "M4 Testing Completed"],
    Testing: ["M4 Testing Completed", "M5 Validation & Release"],
    Validation: ["M5 Validation & Release", "M6 Final Test Readiness"],
    Closure: ["M6 Final Test Readiness", "M7 Project Closure"],
    "Closure – Parallel Review": [
      "M6 Final Test Readiness",
      "M7 Project Closure",
    ],
    "Post-Closure Audit": ["M7 Project Closure", "M8 Audit & Archive"],
    "Planning – Parallel Kickoff": ["M1 Planning", "Parallel Start"],
    "Design – Parallel Track": ["Parallel Start", "Parallel Mid"],
    "Parallel Track – to Validation": [
      "Parallel Mid",
      "M5 Validation & Release",
    ],
    "Design – Subflow Review": ["M2 Design Approved", "Subflow Review"],
    "Prototype – Subflow Validation": [
      "Subflow Review",
      "M5 Validation & Release",
    ],
    "Subflow Finalization": ["M5 Validation & Release", "M7 Project Closure"],
    "Design – Parallel Track B": ["Parallel Start", "Parallel Mid"],
    "Design – Parallel to Validation": [
      "Parallel Mid",
      "M5 Validation & Release",
    ],
  } as Record<string, [string, string]>,

  independentPhases: [
    {
      name: "Independent Phase A",
      description: "Standalone phase without milestones A",
    },
    {
      name: "Independent Phase B",
      description: "Standalone phase without milestones B",
    },
    {
      name: "Independent Phase C",
      description: "Standalone phase without milestones C",
    },
  ] as Array<{ name: string; description: string }>,
  workPackages: [],
  artifact: {},
} as const;
