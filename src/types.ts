// 📘 src/types.ts
export interface NovaApp {
  id?: string;
  name: string;
  dataSchemaVersion?: string;
  configSchemaVersion?: string;
  createdBy?: string | null;
  modifiedBy?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
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
  id?: string;
  name: string;
  description?: string;
  type: string;
  relativePath: string;
}

export interface ArtifactWebForm {
  id?: string;
  name: string;
  description?: string;
  type: string;
  appConfiguration?: Record<string, any>;
  novaApp?: string;
}
export interface IndependentPhase {
  name: string;
  description: string;
}

export interface WorkPackage {
  name: string;
  description: string;
  phaseId: string;
}

export interface Artifact {
  files?: ArtifactFile[];
  webForms?: ArtifactWebForm[];
}

export interface ProcessConfig {
  processData: any;
  processVersions?: TypeProcessVersion[];
  milestones: any[];
  map: Record<string, [string, string]>;
  independentPhases?: IndependentPhase[];
  workPackages?: WorkPackage[];
  novaApps?: NovaApp[];
  artifact?: Artifact;
  activities?: Activity[];
}
export interface Process {
  id?: string;
  name: string;
  description: string;
  documentationUrl: string;
  lifecycle: "DRAFT" | "LIVE" | "END_OF_LIFE";
}

export interface TypeProcessVersion {
  name: string;
  description?: string;
}

export interface Activity {
  id?: string;
  name: string;
  description: string;
  responsibleRole?: string | null;
  supportingRoles?: string[];
  inputArtifacts?: ArtifactFile[] | undefined;
  outputArtifacts?: ArtifactWebForm[] | undefined;
  workPackageId: string;
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
