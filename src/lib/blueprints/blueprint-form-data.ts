import { prisma } from "@/lib/prisma";

export type BlueprintFormOptions = {
  customers: { id: number; name: string }[];
  departments: { id: number; name: string }[];
};

export async function getBlueprintFormOptions(): Promise<BlueprintFormOptions> {
  const [customers, departments] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { customers, departments };
}
