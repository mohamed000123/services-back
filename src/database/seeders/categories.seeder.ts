import prisma from "../client";

export const CATEGORY_IDS = {
  wash: "11111111-1111-4111-8111-111111111101",
  detail: "11111111-1111-4111-8111-111111111102",
} as const;

export async function seedCategories(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding categories...");
  await prisma.category.upsert({
    where: { id: CATEGORY_IDS.wash },
    create: {
      id: CATEGORY_IDS.wash,
      name: "Car wash",
      isActive: true,
    },
    update: { name: "Car wash", isActive: true, deletedAt: null },
  });
  await prisma.category.upsert({
    where: { id: CATEGORY_IDS.detail },
    create: {
      id: CATEGORY_IDS.detail,
      name: "Car detailing",
      isActive: true,
    },
    update: { name: "Car detailing", isActive: true, deletedAt: null },
  });
}
