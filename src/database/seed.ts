import prisma from "./client";
import { seedAdministrators } from "./seeders/administrators.seeder";

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Starting database seed...");

  try {
    await seedAdministrators();
    // eslint-disable-next-line no-console
    console.log("Database seed completed successfully!");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error during seeding:", error);
    throw error;
  }
}

// Run the seed function
main()
  .catch((e: Error) => {
    // eslint-disable-next-line no-console
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
