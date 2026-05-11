import type { AdministratorRole } from "@/database/generated/client";

declare global {
  namespace Express {
    interface Locals {
      admin?: {
        id: string;
        email: string;
        role: AdministratorRole;
      };
    }
  }
}

export {};
