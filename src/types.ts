// 📘 src/types.ts
export interface PmApp {
  id: string | null;
  name: string;
  dataSchemaVersion: string;
  configSchemaVersion: string;
  contextPath: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
}

export interface Phase {
  id: string;
  name: string;
  previousMilestone?: string; // Optional for independent phases
  nextMilestone?: string; // Optional for independent phases
  description?: string;
}

export interface ArtifactFile {
  id: string;
  name: string;
  description: string;
  relativePath: string;
}

export interface Process {
  id?: string;
  name: string;
  description: string;
  documentationUrl: string;
  lifecycle: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  responsibleRole?: string;
  supportingRoles?: string[];
  inputArtifacts?: string[];
  outputArtifacts?: string[];
  workPackageId: string;
}

export interface WorkPackage {
  id: string;
  name: string;
  description: string;
  phaseId: string;
}

export type Endeavor = {
  id: string;
  name: string;
  description: string;
  owner: string;
  proxy: string;
  sponsor: string;
  partnerGb: string;
  businessUnit: string;
  currency: string;
  category: string;
  type: string;
  mcrId: string;
  status: "OPEN" | "IN_PROGRESS" | "DISABLED" | "DONE"; // expand as needed
};
