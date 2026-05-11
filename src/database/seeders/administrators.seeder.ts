import bcrypt from "bcrypt";
import prisma from "../client";
import env from "@/config/env";
import type { Prisma } from "@/database/generated/client";
import { AdministratorRole } from "@/database/generated/client";

/**
 * Seeds the bootstrap super administrator from `.env`:
 * `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_FULL_NAME`, `SUPER_ADMIN_ID`
 *
 * Idempotent: upserts by unique `email`.
 */
export async function seedAdministrators(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding super administrator...");

  const email: string = env("SUPER_ADMIN_EMAIL").trim();
  const password: string = env("SUPER_ADMIN_PASSWORD");
  const fullName: string = env("SUPER_ADMIN_FULL_NAME").trim();
  const superAdminId: string = env("SUPER_ADMIN_ID").trim();

  const passwordHash: string = await bcrypt.hash(password, 10);

  const create: Prisma.AdministratorCreateInput = {
    id: superAdminId,
    fullName,
    email,
    password: passwordHash,
    role: AdministratorRole.SUPER_ADMIN,
  };

  await prisma.administrator.upsert({
    where: { email },
    update: {
      fullName,
      password: passwordHash,
      role: AdministratorRole.SUPER_ADMIN,
    },
    create,
  });

  // eslint-disable-next-line no-console
  console.log("Seeded super administrator (upsert by email)");
}
