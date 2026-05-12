import prisma from "../client";
import { Prisma } from "@/database/generated/client";
import { CATEGORY_IDS } from "./categories.seeder";

const SERVICE_IDS = {
  express: "22222222-2222-4222-8222-222222222201",
  fullDetail: "22222222-2222-4222-8222-222222222202",
  interior: "22222222-2222-4222-8222-222222222203",
} as const;

export async function seedServices(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding services...");
  const rows: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    categoryId: string;
  }[] = [
    {
      id: SERVICE_IDS.express,
      name: "Express exterior car wash",
      description: "Fast outside wash: body, glass, and wheels",
      price: 45,
      categoryId: CATEGORY_IDS.wash,
    },
    {
      id: SERVICE_IDS.fullDetail,
      name: "Full interior and exterior detail",
      description: "Complete inside-and-out clean, shine, and finish",
      price: 220,
      categoryId: CATEGORY_IDS.detail,
    },
    {
      id: SERVICE_IDS.interior,
      name: "Interior deep clean",
      description: "Vacuum, panels, and interior surfaces",
      price: 120,
      categoryId: CATEGORY_IDS.detail,
    },
  ];

  await Promise.all(
    rows.map((r) =>
      prisma.service.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          name: r.name,
          description: r.description,
          price: new Prisma.Decimal(r.price),
          categoryId: r.categoryId,
          isActive: true,
        },
        update: {
          name: r.name,
          description: r.description,
          price: new Prisma.Decimal(r.price),
          categoryId: r.categoryId,
          isActive: true,
          deletedAt: null,
        },
      }),
    ),
  );
}

export { SERVICE_IDS };
