// API module providing create* functions and helpers

import axios from "axios";
import {
  Activity,
  ArtifactFile,
  ArtifactWebForm,
  Endeavor,
  Milestone,
  NovaApp,
  Phase,
  Process,
  TypeProcessVersion,
  WorkPackage,
} from "../types";
import { HttpsProxyAgent } from "https-proxy-agent";

const GLOBAL_XSRF = process.env.XSRF_TOKEN || "1";

// let backendURL: string =
// process.env.BACKEND_URL || "https://nova-dev.aid.bosch.com";
let backendURL: string = process.env.BACKEND_URL || "http://localhost:8080";

// get proxy URL from env or fallback
const proxyUrl = process.env.HTTPS_PROXY || "http://127.0.0.1:3128";

// pass the URL string directly
const agent = new HttpsProxyAgent(proxyUrl);

// if you need to ignore self-signed certs (dev only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function setBackendURL(url: string) {
  backendURL = (url || "http://localhost:8080").replace(/\/$/, "");
}

export function getBackendURL() {
  return backendURL;
}

// Helper: build standard headers (optionally tenant header)
function buildHeaders(
  session: string,
  tenantId?: string
): Record<string, string> {
  const h: Record<string, string> = {
    Cookie: `JSESSIONID=${session}; XSRF-TOKEN=${GLOBAL_XSRF};`,
    "X-XSRF-TOKEN": GLOBAL_XSRF,
    "Content-Type": "application/json",
  };
  if (tenantId) h["Nova-Tenant-Id"] = tenantId;
  return h;
}

export function logHttpError(context: string, err: any) {
  if (err?.response) {
    const { status, data } = err.response;
    let body: string;
    try {
      body = typeof data === "string" ? data : JSON.stringify(data);
    } catch {
      body = "[unserializable body]";
    }
    console.error(`[${context} ERROR]`, status, body);
  } else {
    console.error(`[${context} ERROR]`, err?.message || err);
  }
}

// Generic POST wrapper returning id or name
async function post(
  context: string,
  session: string,
  path: string,
  payload: any,
  tenantId?: string
): Promise<string | undefined> {
  const url = `${backendURL}${path}`;
  try {
    const res = await axios.post(url, payload, {
      headers: buildHeaders(session, tenantId),
      httpsAgent: agent, // ✅ use proxy agent
      proxy: false, // ✅ prevent Axios double-proxying
    });
    return res.data?.id ?? res.data?.name;
  } catch (e) {
    logHttpError(context, e);
    throw e;
  }
}

export async function createProcess(
  session: string,
  tenantId: string,
  payload: Process
) {
  return post(
    "CREATE_PROCESS",
    session,
    "/api/v1/process-model/processes",
    payload,
    tenantId
  );
}

export async function createProcessVersion(
  session: string,
  tenantId: string,
  processId: string,
  payload: TypeProcessVersion
) {
  return post(
    "CREATE_PROCESS",
    session,
    `/api/v1/process-model/processes/${processId}/versions`,
    payload,
    tenantId
  );
}

export async function createMilestone(
  session: string,
  tenantId: string,
  payload: Milestone
) {
  return post(
    "CREATE_MILESTONE",
    session,
    "/api/v1/process-model/milestones",
    payload,
    tenantId
  );
}

export async function createPhase(
  session: string,
  tenantId: string,
  processId: string,
  payload: Phase
) {
  return post(
    "CREATE_PHASE",
    session,
    `/api/v1/process-model/processes/${processId}/phases`,
    payload,
    tenantId
  );
}

export async function createWorkPackage(
  session: string,
  tenantId: string,
  processId: string,
  phaseId: string,
  payload: WorkPackage
) {
  return post(
    "CREATE_WORK_PACKAGE",
    session,
    `/api/v1/process-model/processes/${processId}/phases/${phaseId}/work-packages`,
    payload,
    tenantId
  );
}

export async function createArtifactWebForm(
  session: string,
  tenantId: string,
  payload: ArtifactWebForm
) {
  return post(
    "CREATE_WEB_FORM",
    session,
    "/api/v1/process-model/web-forms",
    payload,
    tenantId
  );
}

export async function createArtifactFile(
  session: string,
  tenantId: string,
  payload: ArtifactFile
) {
  return post(
    "CREATE_WEB_FORM",
    session,
    "/api/v1/process-model/files",
    payload,
    tenantId
  );
}

export async function createActivity(
  session: string,
  tenantId: string,
  processId: string,
  phaseId: string,
  workPackageId: string,
  payload: Activity
) {
  return post(
    "CREATE_ACTIVITY",
    session,
    `/api/v1/process-model/processes/${processId}/phases/${phaseId}/work-packages/${workPackageId}/activities`,
    payload,
    tenantId
  );
}

export async function createNovaApp(session: string, payload: NovaApp) {
  const url = `${backendURL}/api/v1/nova-apps-registry`;

  const headers: Record<string, string> = {
    Cookie: `JSESSIONID=${session}; XSRF-TOKEN=${GLOBAL_XSRF};`,
    "X-XSRF-TOKEN": GLOBAL_XSRF,
    "Content-Type": "application/json",
  };
  const name = payload.name;
  try {
    const res = await axios.post(url, payload, { headers });
    return res.data?.id ?? res.data?.name ?? name;
  } catch (e: any) {
    if (
      e?.response?.status === 400 &&
      typeof e?.response?.data?.detail === "string" &&
      e.response.data.detail.includes("already exists")
    ) {
      console.warn(
        "[CREATE_NOVA_APP] Duplicate name detected, reusing existing name:",
        name
      );
      return name;
    }
    logHttpError("CREATE_NOVA_APP", e);
    throw e;
  }
}

export async function fetchRoleId(
  session: string,
  tenantId: string,
  roleName: string
) {
  try {
    const headers: Record<string, string> = {
      Cookie: `JSESSIONID=${session}; XSRF-TOKEN=${GLOBAL_XSRF};`,
      "X-XSRF-TOKEN": GLOBAL_XSRF,
      "Nova-Tenant-Id": tenantId,
      Accept: "application/json",
    };
    const res = await axios.get(
      `${backendURL}/api/v1/domain/functional-roles`,
      { headers }
    );
    const data = res.data;
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    const found = list.find((r) => r?.role === roleName);
    return found?.id;
  } catch (e) {
    logHttpError("FETCH_ROLE_ID", e);
    return undefined;
  }
}
export async function createRole(
  session: string,
  tenantId: string,
  roleName: string
) {
  // simplified using post for happy path
  try {
    const id = await post(
      "CREATE_ROLE",
      session,
      "/api/v1/domain/functional-roles",
      { id: "", role: roleName, description: "string" },
      tenantId
    );
    return id ?? roleName;
  } catch (e: any) {
    const status = e?.response?.status;
    const detail: string | undefined = e?.response?.data?.detail;
    if (status === 400 && detail?.includes("already exists")) {
      console.warn(
        "[CREATE_ROLE] Duplicate role detected, fetching existing role ID"
      );
      const existingId = await fetchRoleId(session, tenantId, roleName);
      return existingId || roleName;
    }
    if (status === 500) {
      console.warn(
        "[CREATE_ROLE] Server error 500, trying to fetch existing role ID"
      );
      const existingId = await fetchRoleId(session, tenantId, roleName);
      if (existingId) return existingId;
    }
    throw e;
  }
}

export async function getTenantId(session: string, name: string) {
  try {
    console.log(
      `[GET_TENANTS] Fetching tenants from ${backendURL}/api/v1/tenants`
    );
    const res = await axios.get(`${backendURL}/api/v1/tenants`, {
      headers: { Cookie: `JSESSIONID=${session};` },
      httpsAgent: agent,
      proxy: false,
    });
    const arr = res.data as Array<any>;
    const entry = Array.isArray(arr)
      ? arr.find((t) => t?.name === name || t?.tenantId === name)
      : undefined;
    return entry?.id;
  } catch (e) {
    logHttpError("GET_TENANTS", e);
    throw e;
  }
}

export function arg(name: string, def?: string) {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.split("=")[1] : def;
}

export async function createEndeavor(
  session: string,
  tenantId: string,
  payload: Endeavor
) {
  return post(
    "CREATE_ENDEAVOR",
    session,
    `/api/v1/project-management/endeavors`,
    payload,
    tenantId
  );
}
