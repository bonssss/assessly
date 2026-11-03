import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Assessly database on Supabase...");

  // 1. Seed Academic Departments
  const departments = [
    {
      code: "CS-101",
      name: "Computer Science & Software Engineering",
      description: "Algorithms, Data Structures, Web Development, Databases, and Systems.",
      status: "ACTIVE" as const,
    },
    {
      code: "MED-101",
      name: "Medicine & Health Sciences",
      description: "Anatomy, Pharmacology, Pathology, Physiology, and Clinical Practice.",
      status: "ACTIVE" as const,
    },
    {
      code: "BUS-101",
      name: "Business & Economics",
      description: "Accounting, Microeconomics, Finance, Marketing, and Management.",
      status: "ACTIVE" as const,
    },
    {
      code: "LAW-101",
      name: "Law & Legal Studies",
      description: "Constitutional Law, Criminal Law, Civil Procedure, and Human Rights.",
      status: "ACTIVE" as const,
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log(`✅ Seeded ${departments.length} academic departments.`);

  // 2. Seed Payment Methods (Telebirr & CBE)
  const paymentMethods = [
    {
      method: "TELEBIRR",
      displayName: "Telebirr",
      accountDetails: "0911223344",
      instructions:
        "1. Open Telebirr app.\n2. Send money to merchant/phone 0911223344.\n3. Take a screenshot of the confirmation receipt.\n4. Submit receipt image and transaction code here.",
      active: true,
    },
    {
      method: "BANK_TRANSFER",
      displayName: "Commercial Bank of Ethiopia (CBE)",
      accountDetails: "1000123456789 (Assessly Platform)",
      instructions:
        "1. Transfer to CBE account 1000123456789.\n2. Upload mobile banking transfer receipt or bank slip.\n3. Enter the transaction reference number.",
      active: true,
    },
  ];

  for (const pm of paymentMethods) {
    const existing = await prisma.paymentSetting.findFirst({
      where: { method: pm.method },
    });
    if (!existing) {
      await prisma.paymentSetting.create({ data: pm });
    }
  }
  console.log(`✅ Seeded ${paymentMethods.length} payment instruction methods.`);

  // 3. Seed Access Packages
  const packages = [
    {
      name: "Department Semester Pass",
      price: 399.0,
      currency: "ETB",
      scope: "DEPARTMENT",
      durationDays: 120,
      status: "PUBLISHED" as const,
    },
    {
      name: "All-Access Annual Pass",
      price: 799.0,
      currency: "ETB",
      scope: "ALL_DEPARTMENTS",
      durationDays: 365,
      status: "PUBLISHED" as const,
    },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({
      where: { name: pkg.name },
    });
    if (!existing) {
      await prisma.package.create({ data: pkg });
    }
  }
  console.log(`✅ Seeded ${packages.length} access packages.`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
