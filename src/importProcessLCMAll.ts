
import { PROCESS_LCM } from "./constant/process-lcm";
import { PROCESS_LCM1 } from "./constant/process-lcm1";
import { PROCESS_LCM2 } from "./constant/process-lcm2";
import {
  arg,
  createMilestone,
  createPhase,
  createProcess,
  getBackendURL,
  getTenantId,
} from "./lib/api";

const ALL_PROCESSES = [PROCESS_LCM, PROCESS_LCM1, PROCESS_LCM2];

async function run() {
  const session = arg("session") || process.env.JSESSIONID;
  if (!session) {
    console.error("❌ Missing session: use --session=<JSESSIONID>");
    process.exit(1);
  }

  const tenantName = arg("name");
  if (!tenantName) {
    console.error("❌ Missing tenant name: use --name=<TENANT_NAME>");
    process.exit(1);
  }

  for (const cfg of ALL_PROCESSES) {
    console.log("\n===================================================");
    console.log(`🚀 Creating process: ${cfg.processData.name}`);
    console.log(`[CFG] Tenant = ${tenantName}`);
    console.log("[CFG] Backend =", getBackendURL());

    const tenantId = await getTenantId(session, tenantName);
    console.log("✅ tenantId =", tenantId);

    // --- Create process
    const processId = await createProcess(session, tenantId, cfg.processData);
    if (!processId) {
      console.error(`❌ Failed to create process: ${cfg.processData.name}`);
      continue;
    }

    // --- Create milestones
    const milestoneMap: Record<string, string> = {};
    for (const m of cfg.milestones) {
      const id = await createMilestone(session, tenantId, m);
      if (id) milestoneMap[m.name] = id;
    }

    // --- Create phases using predefined map
    for (const [phaseName, [from, to]] of Object.entries(cfg.map)) {
      const previousMilestone = milestoneMap[from];
      const nextMilestone = milestoneMap[to];
      if (!previousMilestone || !nextMilestone) {
        console.warn(`⚠️ Missing milestone for ${phaseName}`);
        continue;
      }

      const phaseObj = {
        id: "",
        name: phaseName,
        description: phaseName,
        previousMilestone,
        nextMilestone,
      };
      const phaseId = await createPhase(session, tenantId, processId, phaseObj);
      if (phaseId) console.log(`  ✅ Created phase: ${phaseName}`);
    }

    // --- Create independent phases (no milestones)
    if (cfg.independentPhases && cfg.independentPhases.length > 0) {
      console.log("\n🔹 Creating independent phases (no milestones)...");
      for (const independentPhase of cfg.independentPhases) {
        const phaseObj = {
          id: "",
          name: independentPhase.name,
          description: independentPhase.description,
        };
        const phaseId = await createPhase(session, tenantId, processId, phaseObj);
        if (phaseId) console.log(`  ✅ Created independent phase: ${independentPhase.name}`);
      }
    }

    console.log(`✅ Finished process: ${cfg.processData.name}`);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(99);
});
