import {
  arg,
  createActivity,
  createArtifactFile,
  createArtifactWebForm,
  createMilestone,
  createPhase,
  createPmApp,
  createProcess,
  createWorkPackage,
  getBackendURL,
  getTenantId,
} from "./lib/api";
import { importMultipleCSVs } from "./lib/importCSV";
import { ArtifactFile } from "./types";

// Helper to print usage
function printUsage() {
  console.log(`Usage:
  --session=JSESSIONID --name=TENANT_NAME [--backendURL=URL] --importPEP=CSV_FILE [--processName=NAME] [--verbose]
      Import PEP CSV and create structure.
  --session=JSESSIONID --name=TENANT_NAME [--backendURL=URL] --createExampleProcess \
      [--processName=NAME --pmAppName=NAME --roleName=NAME --milestoneA=NAME --milestoneB=NAME --phaseName=NAME --workPackageName=NAME --activityName=NAME]
      Create a minimal example process.

Optional flags:
  --backendURL   Backend base URL (default http://localhost:8080)
  --processName  Override process name for import (else derived from file)
  --verbose      Show IDs inside the ASCII tree output
`);
}

async function run() {
  const session = arg("session") || process.env.JSESSIONID;
  console.log("session: ", session);
  if (!session) {
    console.error("Missing session: --session=<JSESSIONID>");
    process.exit(1);
  }
  console.log("[CFG] name =", arg("name"));
  const tenantName = arg("name") || "ALPS1DevMock";

  const backendURLArg = arg("backendURL");
  if (!backendURLArg) {
    console.log("[CFG] backendURL =", getBackendURL());
  }

  console.log("[NEXT] getTenantId name =", tenantName);
  const tenantId = await getTenantId(session, tenantName);
  console.log("[NEXT] tenantId =", tenantId);

  const data = await importMultipleCSVs([
    "src/data/pm-app.csv",
    "src/data/milestones.csv",
  ]);
  // registry pm app

  let pmAppName = "";
  for (const p of data["pm-app"]) {
    const pmAppId = await createPmApp(session, p);
    console.log("✅ Created PmApp with ID:", pmAppId);
    pmAppName = p.name;
  }
  // create milestone
  let milestoneIds: string[] = [];
  for (const m of data["milestones"]) {
    const milestoneId = await createMilestone(session, tenantId, m);
    if (milestoneId) {
      milestoneIds.push(milestoneId);
    }
  }

  // // create artifacts
  const webFormId = await createArtifactWebForm(session, tenantId, pmAppName);
  if (!webFormId) throw new Error("No web form ID received");

  const payloadArtifactFile = {
    id: "",
    name: "Sample Artifact File",
    description: "This is a sample artifact file.",
    relativePath: "/artifacts/sample-file.txt",
  } as ArtifactFile;

  const fileId = await createArtifactFile(
    session,
    tenantId,
    payloadArtifactFile
  );
  if (!fileId) throw new Error("No artifact file ID received");

  // create processes 1
  const payloadProcess1 = {
    id: "",
    name: "Type Process 1",
    description: "Defines the initial planning and preparation of the project.",
    documentationUrl: "https://example.com/process1",
    lifecycle: "PLAN",
  };
  const processId1 = await createProcess(session, tenantId, payloadProcess1);
  if (!processId1) throw new Error("No process ID received");

  // // create processes 2
  const payloadProcess2 = {
    id: undefined,
    name: "Type Process 2",
    description:
      "Covers execution, testing, and final validation steps of the project.",
    documentationUrl: "https://example.com/process2",
    lifecycle: "LIVE",
  };
  const processId2 = await createProcess(session, tenantId, payloadProcess2);
  if (!processId2) throw new Error("No process ID received");

  // // create phase 1
  const payloadPhase1 = {
    id: "",
    name: "Phase 1 - Initiation",
    description: "Initial phase of the project focusing on setup and kickoff.",
    previousMilestone: milestoneIds[0],
    nextMilestone: milestoneIds[1],
  };

  const phaseId1 = await createPhase(
    session,
    tenantId,
    processId1,
    payloadPhase1
  );
  if (!phaseId1) throw new Error("No phase ID received");

  // // create phase 2
  const payloadPhase2 = {
    id: "",
    name: "Phase 2 - Execution",
    description:
      "Main execution phase where development and testing activities occur.",
    previousMilestone: milestoneIds[2],
    nextMilestone: milestoneIds[3],
  };
  const phaseId2 = await createPhase(
    session,
    tenantId,
    processId2,
    payloadPhase2
  );
  if (!phaseId2) throw new Error("No phase ID received");

  // create work package 1

  const payloadWP1 = {
    id: "",
    name: "Work Package 1",
    description: "Work package for initial setup tasks.",
    phaseId: phaseId1,
  };

  const wp1 = await createWorkPackage(
    session,
    tenantId,
    processId1,
    phaseId1,
    payloadWP1
  );
  if (!wp1) throw new Error("No work package ID received");

  // create work package 3
  const payloadWP2 = {
    id: "",
    name: "Work Package 2",
    description: "Work package for initial setup tasks.",
    phaseId: phaseId2,
  };

  const wp2 = await createWorkPackage(
    session,
    tenantId,
    processId2,
    phaseId2,
    payloadWP2
  );
  if (!wp2) throw new Error("No work package ID received");

  // create activities 1
  const payloadActivity1 = {
    id: "",
    name: "Activity 1",
    description: "Initial setup",
    responsibleRole: undefined,
    supportingRoles: [],
    inputArtifacts: [fileId],
    outputArtifacts: [webFormId],
    workPackageId: wp1,
  };

  const activity1 = await createActivity(
    session,
    tenantId,
    processId1,
    phaseId1,
    wp1,
    payloadActivity1
  );
  if (!activity1) throw new Error("No activity ID received");

  // create activities 2
  const payloadActivity2 = {
    id: "",
    name: "Activity 2",
    description: "Initial setup",
    responsibleRole: undefined,
    supportingRoles: [],
    inputArtifacts: [fileId],
    outputArtifacts: [webFormId],
    workPackageId: wp2,
  };

  const activity2 = await createActivity(
    session,
    tenantId,
    processId2,
    phaseId2,
    wp2,
    payloadActivity2
  );
  if (!activity2) throw new Error("No activity ID received");
}

run().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(99);
});
