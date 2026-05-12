import prisma from "./client";
import { seedAdministrators } from "./seeders/administrators.seeder";
import { seedCategories } from "./seeders/categories.seeder";
import { seedDemoClients } from "./seeders/demoClients.seeder";
import { seedServices } from "./seeders/services.seeder";

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Starting database seed...");

  try {
    await seedAdministrators();
    await seedCategories();
    await seedServices();
    await seedDemoClients();
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
