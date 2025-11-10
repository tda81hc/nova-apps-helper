import {
  arg,
  createMilestone,
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
}

run().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(99);
});
