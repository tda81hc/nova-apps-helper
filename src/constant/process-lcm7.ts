// path: src/data/process_lcm.ts

export const PROCESS_LCM7 = {
  novaApps: [
    {
      name: "businessCase",
      dataSchemaVersion: "1.0.0",
      configSchemaVersion: "1.0.0",
      createdBy: null,
      modifiedBy: null,
      createdAt: null,
      modifiedAt: null,
    },
  ],

  processData: {
    name: "Type Process Demo For Business Case 1",
    description: "Demo process created via script",
    documentationUrl: "https://example.com",
    lifecycle: "PLAN",
  },

  milestones: [
    { name: "M0 Start", description: "Project start milestone" },
    { name: "M1 Planning", description: "Planning milestone" },
    { name: "M1.1 Requirements Review", description: "Review and align requirements" },
    { name: "M1.2 Stakeholder Sync", description: "Stakeholder review and approval" },
    { name: "M1.3 Feasibility Gate", description: "Feasibility evaluation checkpoint" },
    { name: "M2 Design Approved", description: "System design approved" },
    { name: "M3 Prototype Ready", description: "Prototype ready" },
    { name: "M4 Testing Completed", description: "Testing completed" },
    { name: "M5 Validation & Release", description: "Validation and release" },
    { name: "M6 Final Test Readiness", description: "Final test readiness" },
    { name: "M7 Project Closure", description: "Project closure" },
    { name: "M8 Audit & Archive", description: "Post-closure audit and archiving" },
  ],

  map: {
    // Main path
    Initiation: ["M0 Start", "M1 Planning"],
    Planning: ["M1 Planning", "M2 Design Approved"],
    "System Design": ["M2 Design Approved", "M3 Prototype Ready"],
    "Prototype Build": ["M3 Prototype Ready", "M4 Testing Completed"],
    Testing: ["M4 Testing Completed", "M5 Validation & Release"],
    Validation: ["M5 Validation & Release", "M6 Final Test Readiness"],
    Closure: ["M6 Final Test Readiness", "M7 Project Closure"],
    "Post-Closure Audit": ["M7 Project Closure", "M8 Audit & Archive"],

    // 2 phases along System Design (M2 → M3)
    "System Architecture Review": ["M2 Design Approved", "M3 Prototype Ready"],
    "Risk Assessment": ["M2 Design Approved", "M3 Prototype Ready"],

    // 2 phases along Validation (M5 → M6)
    "Field Trial Preparation": ["M6 Final Test Readiness", "M7 Project Closure"],
    "Safety Compliance Check": ["M6 Final Test Readiness", "M7 Project Closure"],

    // 3 phases inside M1 → M2
    "Requirements Alignment": ["M1 Planning", "M1.1 Requirements Review"],
    "Stakeholder Review": ["M1.1 Requirements Review", "M1.2 Stakeholder Sync"],
    "Feasibility Check": ["M1.2 Stakeholder Sync", "M5 Validation & Release"],
  } as Record<string, [string, string]>,

  independentPhases: [
    { name: "Independent Phase A", description: "Standalone phase without milestones A" },
    { name: "Independent Phase B", description: "Standalone phase without milestones B" },
    { name: "Independent Phase C", description: "Standalone phase without milestones C" },
  ] as Array<{ name: string; description: string }>,

  workPackages: [
    {
      id: "",
      name: "Work Package - System Design",
      description: "Work package for System Design",
      phaseId: "System Design",
    },
  ],

  artifact: {
    webForms: [
      {
        name: "Business Case",
        description: "Requirements intake form",
        type: "WEBFORM",
        appConfiguration: { empty: true },
        novaApp: "businessCase",
      },
    ],
    files: [
      {
        name: "Artifact File",
        description: "Artifact File",
        type: "FILE",
        relativePath: "/apic",
      },
    ],
  },

  activities: [
    {
      name: "Prototype Simulation 2",
      description: "Simulate prototype before assembly",
      responsibleRole: null,
      supportingRoles: [],
      inputArtifacts: ["Business Case"],
      outputArtifacts: ["Business Case"],
      workPackageId: "Work Package - System Design",
      phaseId: "System Design",
    },
  ],
} as const;
