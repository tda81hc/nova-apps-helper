import fs from "node:fs";
import csv from "csv-parser";
import { Endeavor, Milestone, NovaApp, Phase, Process } from "../types";
import path from "node:path";



// Đọc 1 file CSV
async function readCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

// Convert dữ liệu sang object đúng kiểu
function convertRows(fileType: string, rows: any[]): any[] {
  const now = new Date().toISOString();

  switch (fileType) {
    case "pm-app":
      return rows.map((r) => ({
        id: r.id && r.id.trim() !== "" ? r.id : null,
        name: r.name,
        dataSchemaVersion: r.dataSchemaVersion || "1.0.0",
        configSchemaVersion: r.configSchemaVersion || "1.0.0",
        createdBy: r.createdBy || "system",
        modifiedBy: r.modifiedBy || "system",
        createdAt: r.createdAt || now,
        modifiedAt: r.modifiedAt || now,
      })) as NovaApp[];

    case "milestones":
    case "proces-lcm-milestones":
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
      })) as Milestone[];

    case "phases":
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        previousMilestone: r.previousMilestone,
        nextMilestone: r.nextMilestone,
        description: r.description || "",
      })) as Phase[];

    case "endeavors":
      return rows.map((r) => ({
        id: r.id || "",
        name: r.name,
        description: r.description,
        owner: r.owner,
        proxy: r.proxy,
        sponsor: r.sponsor,
        partnerGb: r.partnerGb,
        businessUnit: r.businessUnit,
        currency: r.currency,
        category: r.category,
        type: r.type,
        mcrId: r.mcrId,
        status: r.status,
      })) as Endeavor[];
      
    case "process":
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        documentationUrl: r.documentationUrl,
        lifecycle: r.lifecycle,
      })) as Process[];

    default:
      console.warn(`⚠️ Unknown file type: ${fileType}`);
      return rows;
  }
}

export async function importMultipleCSVs(
  filePaths: string[]
): Promise<Record<string, any[]>> {
  const results: Record<string, any[]> = {};

  for (const filePath of filePaths) {
    const fileType = path.basename(filePath, ".csv"); // e.g. "apps", "milestones"
    const rawRows = await readCSVFile(filePath);
    const converted = convertRows(fileType, rawRows);
    results[fileType] = converted;

    console.log(`✅ Loaded ${fileType}: ${converted.length} items`);
  }

  console.log("🎉 All CSV files imported successfully!");
  return results;
}
