import "dotenv/config";
import { defineConfig } from "prisma/config";

const GENERATE_PLACEHOLDER =
  "postgresql://127.0.0.1:5432/_prisma_generate_placeholder?schema=public";

function datasourceUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  // `prisma generate` does not open a connection; allow CI / fresh clones without `.env`.
  const argv = process.argv.join(" ");
  if (argv.includes("generate") && !argv.includes("migrate")) {
    return GENERATE_PLACEHOLDER;
  }
  throw new Error(
    "DATABASE_URL is not set. Add it to `.env` for migrate, Studio, db seed, and runtime.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl(),
  },
});
