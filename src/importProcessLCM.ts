import {
  arg,
  createMilestone,
  createPhase,
  createProcess,
  getBackendURL,
  getTenantId,
} from "./lib/api";
import { importMultipleCSVs } from "./lib/importCSV";

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
    "src/data/proces-lcm-milestones.csv",
    "src/data/process.csv",
    "src/data/phases.csv",
  ]);

  let mIds: string[] = [];
  for (const m of data["proces-lcm-milestones"]) {
    const mId = await createMilestone(session, tenantId, m);
    if (mId) {
      mIds.push(mId);
    }
  }

  let pIds: string[] = [];
  for (const p of data["process"]) {
    const pId = await createProcess(session, tenantId, p);
    if (pId) {
      pIds.push(pId);
    }
  }

  // create phase
  const phasesWithMilestones = [];

  for (let i = 0; i < data["phases"].length; i++) {
    const phase = data["phases"][i];
    let previousMilestone: string | null = null;
    let nextMilestone: string | null = null;

    // 🔹 Default sequential mapping (always have both)
    if (i === 0) {
      // Phase 1: start from milestone 0 → milestone 1
      previousMilestone = mIds[0];
      nextMilestone = mIds[1] || mIds[0]; // fallback if only one milestone
    } else if (i < mIds.length - 1) {
      // Phase i → between milestone[i] and milestone[i+1]
      previousMilestone = mIds[i];
      nextMilestone = mIds[i + 1];
    } else {
      // Last phase: use last two milestones if exist
      previousMilestone = mIds[mIds.length - 2];
      nextMilestone = mIds[mIds.length - 1];
    }

    // 🔹 Override for parallel phases
    if (phase.name.startsWith("Phase 7")) {
      // Parallel to Phase 2 (Planning)
      previousMilestone = mIds[1];
      nextMilestone = mIds[2];
    }

    if (phase.name.startsWith("Phase 8")) {
      // Parallel to Phase 3 (Design)
      previousMilestone = mIds[2];
      nextMilestone = mIds[3];
    }

    // ✅ Ensure both provided or both null
    const bothProvided = previousMilestone && nextMilestone;
    const bothNull = !previousMilestone && !nextMilestone;

    if (!bothProvided && !bothNull) {
      console.warn(
        `⚠️ Invalid mapping for phase "${phase.name}". Both previousMilestone and nextMilestone must be provided or both null.`
      );
      continue;
    }

    const phaseObj = {
      id: "",
      name: phase.name,
      description: phase.description,
      previousMilestone: previousMilestone || "",
      nextMilestone: nextMilestone || "",
    };

    const phaseId = await createPhase(session, tenantId, pIds[0], phaseObj);
    if (phaseId) {
      phaseObj.id = phaseId;
    }
    phasesWithMilestones.push(phaseObj);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(99);
});
