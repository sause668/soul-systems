import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/app/generated/prisma/client/client";
import { seedDemoJobs } from "./seeds/demo-jobs";
import { seedManufacturing } from "./seeds/manufacturing";
import { seedStock } from "./seeds/stock";
import { seedUsers } from "./seeds/users";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run prisma db seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await seedManufacturing(prisma);
  await seedStock(prisma);
  const creds = await seedUsers(prisma);
  await seedDemoJobs(prisma);

  console.log("Seed complete. Demo logins:", creds);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
