import type { Prisma } from "@/app/generated/prisma/client/client";

export type ProcessPartsPayload = Prisma.ProcessGetPayload<{
  include: {
    job: { select: { numOfUnits: true } };
    processBlueprint: { include: { issueBlueprints: true } };
    issueJobs: true;
  };
}>;

export type PartRequirementRow = {
  partNumber: string;
  required: number;
  issued: number;
};

/** Total required per part = blueprint quantityNeeded × job units (per finished job unit). */
export function buildPartRequirementRows(process: ProcessPartsPayload): PartRequirementRow[] {
  const units = process.job.numOfUnits;
  const requiredByPart = new Map<string, number>();
  for (const ib of process.processBlueprint?.issueBlueprints ?? []) {
    const add = ib.quantityNeeded * units;
    requiredByPart.set(ib.partNumber, (requiredByPart.get(ib.partNumber) ?? 0) + add);
  }

  const issuedByPart = new Map<string, number>();
  for (const ij of process.issueJobs) {
    issuedByPart.set(ij.partNumber, (issuedByPart.get(ij.partNumber) ?? 0) + ij.quantityIssued);
  }

  const keys = new Set<string>([...requiredByPart.keys(), ...issuedByPart.keys()]);
  const rows: PartRequirementRow[] = [];
  for (const partNumber of keys) {
    rows.push({
      partNumber,
      required: requiredByPart.get(partNumber) ?? 0,
      issued: issuedByPart.get(partNumber) ?? 0,
    });
  }
  rows.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
  return rows;
}

export function hasBlueprintPartRequirements(process: ProcessPartsPayload): boolean {
  return (process.processBlueprint?.issueBlueprints?.length ?? 0) > 0;
}
