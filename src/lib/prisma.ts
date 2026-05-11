import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  // `next build` imports route modules and evaluates Prisma; no DB is contacted during SSG data collection.
  if (process.env.npm_lifecycle_event === "build") {
    return "postgresql://127.0.0.1:5432/_next_build_placeholder?schema=public";
  }
  throw new Error("DATABASE_URL is not set");
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
