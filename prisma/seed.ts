// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Qd@12345", 10);

  await prisma.user.upsert({
    where: { email: "danadmin@gmail.com" },
    update: {},
    create: {
      email: "danadmin@gmail.com",
      fullName: "Daniels Admin",
      password: passwordHash,
      role: "ADMIN"
    },
  });
}

main().finally(() => prisma.$disconnect());
