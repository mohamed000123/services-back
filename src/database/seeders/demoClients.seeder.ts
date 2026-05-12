import bcrypt from "bcrypt";
import prisma from "../client";

export const DEMO_CLIENT_ID = "33333333-3333-4333-8333-333333333301";

/**
 * Demo mobile users for Postman / local testing (password: `DemoPass1`).
 */
export async function seedDemoClients(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding demo clients...");
  const passwordHash: string = await bcrypt.hash("DemoPass1", 10);
  await prisma.client.upsert({
    where: { email: "demo.client@example.com" },
    create: {
      id: DEMO_CLIENT_ID,
      phone: "+201000000001",
      email: "demo.client@example.com",
      fullName: "Demo Client",
      password: passwordHash,
    },
    update: {
      fullName: "Demo Client",
      phone: "+201000000001",
      password: passwordHash,
    },
  });
}
