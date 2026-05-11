import bcrypt from "bcryptjs";
import type { PrismaClient } from "../../src/app/generated/prisma/client/client";

export const DEMO_PASSWORD = "DemoSoul!!99";

export async function seedUsers(prisma: PrismaClient) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);

  const laserDept = await prisma.department.findUnique({ where: { name: "Laser" } });
  if (!laserDept) throw new Error("Laser department missing — run manufacturing seed first");

  const adminEmail = "admin@soul.local";
  const workerEmail = "laser.worker@soul.local";

  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: "plant.admin",
        password,
        firstName: "Jordan",
        lastName: "Reyes",
        role: "ADMIN",
      },
    });
  }

  const adminProfile = await prisma.admin.findFirst({ where: { userId: adminUser.id } });
  if (!adminProfile) {
    await prisma.admin.create({ data: { userId: adminUser.id } });
  }

  let workerUser = await prisma.user.findUnique({ where: { email: workerEmail } });
  if (!workerUser) {
    workerUser = await prisma.user.create({
      data: {
        email: workerEmail,
        username: "laser.operator",
        password,
        firstName: "Avery",
        lastName: "Nguyen",
        role: "WORKER",
      },
    });
  }

  const workerProfile = await prisma.worker.findFirst({
    where: { userId: workerUser.id, departmentId: laserDept.id },
  });
  if (!workerProfile) {
    await prisma.worker.create({
      data: { userId: workerUser.id, departmentId: laserDept.id },
    });
  }

  return { adminEmail, workerEmail, demoPassword: DEMO_PASSWORD } as const;
}
