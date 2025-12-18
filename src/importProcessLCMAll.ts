import { PROCESS_LCM } from "./constant/process-lcm";
import { PROCESS_LCM1 } from "./constant/process-lcm1";
import { PROCESS_LCM2 } from "./constant/process-lcm2";
import { PROCESS_LCM3 } from "./constant/process-lcm3";
import { PROCESS_LCM4 } from "./constant/process-lcm4";
import { PROCESS_LCM5 } from "./constant/process-lcm5";
import { PROCESS_LCM6 } from "./constant/process-lcm6";
import { PROCESS_LCM7 } from "./constant/process-lcm7";
import {
  arg,
  createActivity,
  createArtifactFile,
  createArtifactWebForm,
  createMilestone,
  createNovaApp,
  createPhase,
  createProcess,
  createProcessVersion,
  createWorkPackage,
  getBackendURL,
  getTenantId,
} from "./lib/api";
import { ArtifactFile, ArtifactWebForm, ProcessConfig } from "./types";

const ALL_PROCESSES: ProcessConfig[] = [
  PROCESS_LCM as unknown as ProcessConfig,
  PROCESS_LCM1 as unknown as ProcessConfig,
  PROCESS_LCM2 as unknown as ProcessConfig,
  PROCESS_LCM3 as unknown as ProcessConfig,
  PROCESS_LCM4 as unknown as ProcessConfig,
  PROCESS_LCM5 as unknown as ProcessConfig,
  PROCESS_LCM6 as unknown as ProcessConfig,
  PROCESS_LCM7 as unknown as ProcessConfig,
];

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

  console.log(`[CFG] Tenant = ${tenantName}`);
  console.log("[CFG] Backend =", getBackendURL());
  const tenantId = await getTenantId(session, tenantName);
  console.log("✅ tenantId =", tenantId);
  if (!tenantId) {
    console.error("❌ Missing tenantId: use --name=<TENANT_NAME>");
    process.exit(1);
  }

  for (const cfg of ALL_PROCESSES) {
    console.log(`🚀 Creating process: ${cfg.processData.name}`);

    // --- Create Nova App
    const createdNovaAppMap: Record<string, string> = {};
    for (const novaApp of cfg.novaApps || []) {
      if (!novaApp.name) {
        console.error(`❌ Missing Nova App configuration`);
      }

      const novaAppId = await createNovaApp(session, novaApp);
      if (novaAppId) {
        console.log("\n===================================================");
        createdNovaAppMap[novaApp.name] = novaAppId;
        console.log(
          `  ✅ Created Nova App: ${novaApp.name} (ID: ${novaAppId})`
        );
      } else {
        console.error(`❌ Failed to create Nova App: ${novaApp.name}`);
        process.exit(1);
      }
    }

    // --- Create Artifact
    // --- Type FILE
    const createdArtifactFiletMap: Record<string, ArtifactFile> = {};
    for (const f of cfg.artifact?.files || []) {
      console.log(`🔹 Uploading Artifact File: ${f.name}`);
      const fileId = await createArtifactFile(session, tenantId, f);
      if (fileId) {
        console.log("\n===================================================");
        createdArtifactFiletMap[f.name] = { ...f, id: fileId };
        console.log(`  ✅ Created Artifact File: ${f.name} (ID: ${fileId})`);
      } else {
        console.error(`❌ Failed to create Artifact File: ${f.name}`);
      }
    }
    // --- Type WEB_FORM
    console.log("\n===================================================");
    const createdArtifactWebFormMap: Record<string, ArtifactWebForm> = {};
    for (const wf of cfg.artifact?.webForms || []) {
      const webFormWithApp = { ...wf, novaApp: wf.novaApp };

      const webFormId = await createArtifactWebForm(
        session,
        tenantId,
        webFormWithApp
      );
      if (webFormId) {
        createdArtifactWebFormMap[wf.name] = {
          ...webFormWithApp,
          id: webFormId,
        };
        console.log(`  ✅ Created Artifact Web Form: ${wf.name}`);
      } else {
        console.error(`❌ Failed to create Artifact Web Form: ${wf.name}`);
      }
    }

    // --- Create process
    const processId = await createProcess(session, tenantId, cfg.processData);
    if (processId) {
      console.log("\n===================================================");
      console.log(
        `  ✅ Created process: ${cfg.processData.name} (ID: ${processId})`
      );
    } else {
      console.error(`❌ Failed to create process: ${cfg.processData.name}`);
      continue;
    }

    // --- Create milestones
    console.log("\n===================================================");
    const milestoneMap: Record<string, string> = {};
    for (const m of cfg.milestones) {
      const id = await createMilestone(session, tenantId, m);
      if (id) milestoneMap[m.name] = id;
    }

    // ⭐ Lưu phaseName → created phaseId backend
    const createdPhaseMap: Record<string, string> = {};

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

      if (phaseId) {
        createdPhaseMap[phaseName] = phaseId; // ⭐ save mapping
        console.log(`  ✅ Created phase: ${phaseName}`);
      }
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

        const phaseId = await createPhase(
          session,
          tenantId,
          processId,
          phaseObj
        );

        if (phaseId) {
          createdPhaseMap[independentPhase.name] = phaseId; // ⭐ save mapping
          console.log(
            `  ✅ Created independent phase: ${independentPhase.name}`
          );
        }
      }
    }

    // --- Create work packages
    const createdWorkPackagesMap: Record<string, string> = {};
    if (cfg.workPackages && cfg.workPackages.length > 0) {
      console.log("\n🔹 Creating work packages...");

      for (const wp of cfg.workPackages) {
        const phaseId = createdPhaseMap[wp.phaseId]; // ⭐  phase name → real Id

        if (!phaseId) {
          console.warn(`⚠️ Missing phaseId for WP: ${wp.name}`);
          continue;
        }

        const workPkg = {
          id: "",
          name: wp.name,
          description: wp.description,
          phaseId,
        };

        const wpId = await createWorkPackage(
          session,
          tenantId,
          processId,
          phaseId,
          workPkg
        );

        if (wpId) {
          createdWorkPackagesMap[wp.name] = wpId; // ⭐ save mapping
          console.log(`  📦 Created work package: ${wp.name}`);
        }
      }
    }

    // ---Create activities
    for (const a of cfg.activities || []) {
      const phaseId = createdPhaseMap[a.phaseId];
      const workPackageId = createdWorkPackagesMap[a.workPackageId];

      const inputArtifacts = a.inputArtifacts
        ?.map((art: any) => {
          const name = typeof art === "string" ? art : art.name;

          const found = createdArtifactFiletMap[name];

          if (found) {
            return found.id;
          }

          return undefined;
        })
        .filter((item): item is string => item !== undefined);

      const outputArtifacts = a.outputArtifacts
        ?.map((art: any) => {
          const name = typeof art === "string" ? art : art.name;

          const found = createdArtifactWebFormMap[name];

          if (found) {
            return found.id;
          }

          return undefined;
        })
        .filter((item): item is string => item !== undefined);

      const activity = {
        ...a,
        inputArtifacts,
        outputArtifacts,
        phaseId,
        workPackageId,
      };
      console.log(`\n🔹 Creating activity: `, activity);
      const activityId = await createActivity(
        session,
        tenantId,
        processId,
        phaseId,
        workPackageId,
        activity
      );
      if (activityId) {
        console.log(`    📝 Created activity: ${a.name}`);
      }
    }

    // --- Create process verions
    console.log("\n===================================================");
    for (const pv of cfg.processVersions || []) {
      console.log(
        `🔹 Creating process version with ${processId}: and payload `,
        JSON.stringify(pv)
      );
      const processVersionId = await createProcessVersion(
        session,
        tenantId,
        processId,
        pv
      );
      if (processVersionId) {
        console.log(`  ✅ Created process version: (ID: ${processVersionId})`);
      }
    }

    console.log(`✅ Finished process: ${cfg.processData.name}`);
  }
}

run().catch((err) => {
  console.error("Fatal error:", (err as Error)?.message || err);
  process.exit(99);
});
