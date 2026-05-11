import { defineConfig } from "prisma/config";
import env from "./src/config/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node -r tsconfig-paths/register src/database/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
