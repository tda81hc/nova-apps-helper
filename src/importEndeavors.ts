import { arg, createEndeavor, getBackendURL, getTenantId } from "./lib/api";
import { importMultipleCSVs } from "./lib/importCSV";

export async function run() {
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

  const data = await importMultipleCSVs(["src/data/endeavors.csv"]);

  for (const endeavor of data["endeavors"]) {
    console.log("Creating Endeavor:", endeavor);
    const endeavorId = await createEndeavor(session, tenantId, endeavor);
    console.log("✅ Created Endeavor with ID:", endeavorId);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(99);
});
