import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);

  const email = args[0] || "admin@assessly.com";
  const password = args[1] || "AdminPassword@123";
  const fullName = args[2] || "System Administrator";
  const role = (args[3] || "SUPER_ADMIN").toUpperCase() as "ADMIN" | "SUPER_ADMIN";

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    console.error("❌ Invalid role. Role must be either ADMIN or SUPER_ADMIN.");
    process.exit(1);
  }

  console.log(`🔧 Creating/Updating admin user on Supabase...`);
  console.log(`   Email: ${email}`);
  console.log(`   Name:  ${fullName}`);
  console.log(`   Role:  ${role}`);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role,
      status: "ACTIVE",
    },
    create: {
      email,
      fullName,
      passwordHash,
      role,
      status: "ACTIVE",
    },
  });

  console.log("✅ Admin user ready!");
  console.log(`   User ID: ${user.id}`);
  console.log(`   Role:    ${user.role}`);
  console.log(`   Login credentials:`);
  console.log(`     Email:    ${email}`);
  console.log(`     Password: ${password}`);
}

createAdmin()
  .catch((err) => {
    console.error("❌ Error creating admin user:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

