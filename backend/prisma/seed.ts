import { PrismaClient } from "@prisma/client";
import { questionsData, mockExams } from "./data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Assessly database on Supabase...");

  // 1. Seed Academic Departments (including ENG-101)
  const departments = [
    {
      code: "CS-101",
      name: "Computer Science & Software Engineering",
      description: "Algorithms, Data Structures, Web Development, Databases, Networks, and Systems.",
      status: "ACTIVE" as const,
    },
    {
      code: "BUS-101",
      name: "Business & Economics",
      description: "Accounting, Microeconomics, Finance, Marketing, and Strategic Management.",
      status: "ACTIVE" as const,
    },
    {
      code: "ENG-101",
      name: "Civil & Environmental Engineering",
      description: "Structural Analysis, Geotechnical Mechanics, Fluid Dynamics, Transportation, and Environmental Engineering.",
      status: "ACTIVE" as const,
    },
    {
      code: "LAW-101",
      name: "Law & Legal Studies",
      description: "Constitutional Law, Criminal Law, Civil Procedure, and Commercial Contracts.",
      status: "ACTIVE" as const,
    },
    {
      code: "MED-101",
      name: "Medicine & Health Sciences",
      description: "Anatomy, Pharmacology, Pathology, Physiology, and Clinical Epidemiology.",
      status: "ACTIVE" as const,
    },
  ];

  const deptMap = new Map<string, string>();
  for (const dept of departments) {
    const record = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: dept,
    });
    deptMap.set(dept.code, record.id);
  }
  console.log(`✅ Seeded ${departments.length} academic departments.`);

  // 2. Seed Payment Methods (Telebirr & CBE)
  const paymentMethods = [
    {
      method: "TELEBIRR",
      displayName: "Telebirr",
      accountDetails: "0938756685",
      instructions:
        "1. Open Telebirr app.\n2. Send money to merchant/phone 0938756685.\n3. Take a screenshot of the confirmation receipt.\n4. Submit receipt image and transaction code here.",
      active: true,
    },
    {
      method: "BANK_TRANSFER",
      displayName: "Commercial Bank of Ethiopia (CBE)",
      accountDetails: "1000126789487 (Assessly Platform)",
      instructions:
        "1. Transfer to CBE account 1000126789487 (Assessly Platform).\n2. Upload mobile banking transfer receipt or bank slip.\n3. Enter the transaction reference number.",
      active: true,
    },
  ];

  for (const pm of paymentMethods) {
    const existing = await prisma.paymentSetting.findFirst({
      where: { method: pm.method },
    });
    if (!existing) {
      await prisma.paymentSetting.create({ data: pm });
    } else {
      await prisma.paymentSetting.update({
        where: { id: existing.id },
        data: {
          accountDetails: pm.accountDetails,
          instructions: pm.instructions,
        },
      });
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

  // 4. Seed Default Super Admin
  const adminEmail = "admin@assessly.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.default.hash("AdminPassword@123", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: "System Super Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Seeded Super Admin account: ${adminEmail} (password: AdminPassword@123)`);
  } else {
    console.log(`ℹ️  Super Admin account already exists: ${adminEmail}`);
  }

  // 5. Seed Comprehensive Question Bank Questions across all departments
  let questionsCreated = 0;
  for (const q of questionsData) {
    const departmentId = deptMap.get(q.deptCode);
    if (!departmentId) continue;

    const existing = await prisma.question.findFirst({
      where: { departmentId, body: q.body },
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          departmentId,
          topic: q.topic,
          body: q.body,
          difficulty: q.difficulty,
          explanation: q.explanation,
          status: "PUBLISHED",
          marks: 1.0,
          options: {
            create: q.options.map((opt, idx) => ({
              optionText: opt.text,
              isCorrect: opt.isCorrect,
              sortOrder: idx + 1,
            })),
          },
        },
      });
      questionsCreated++;
    }
  }
  console.log(`✅ Seeded ${questionsCreated} new questions into academic question banks.`);

  // 6. Ensure Each Department has an active Mock Exit Examination and link all questions
  const deptIds = mockExams
    .map((e) => deptMap.get(e.deptCode))
    .filter((id): id is string => Boolean(id));

  const allPublishedQuestions = await prisma.question.findMany({
    where: { departmentId: { in: deptIds }, status: "PUBLISHED" },
  });

  const questionsByDept = new Map<string, typeof allPublishedQuestions>();
  for (const q of allPublishedQuestions) {
    const list = questionsByDept.get(q.departmentId) || [];
    list.push(q);
    questionsByDept.set(q.departmentId, list);
  }

  for (const examData of mockExams) {
    const departmentId = deptMap.get(examData.deptCode);
    if (!departmentId) continue;

    const deptQuestions = questionsByDept.get(departmentId) || [];

    let exam = await prisma.exam.findFirst({
      where: { departmentId, title: examData.title },
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          departmentId,
          title: examData.title,
          instructions: examData.instructions,
          durationMinutes: examData.durationMinutes,
          feedbackPolicy: "AFTER_SUBMISSION",
          status: "PUBLISHED",
        },
      });
      console.log(`✅ Created published Mock Exit Examination for ${examData.deptCode}: "${exam.title}"`);
    }

    // Link any missing questions to the examination
    for (let idx = 0; idx < deptQuestions.length; idx++) {
      const deptQuestion = deptQuestions[idx];
      await prisma.examQuestion.upsert({
        where: {
          examId_questionId: {
            examId: exam.id,
            questionId: deptQuestion.id,
          },
        },
        update: {
          sequence: idx + 1,
        },
        create: {
          examId: exam.id,
          questionId: deptQuestion.id,
          marks: 1.0,
          sequence: idx + 1,
        },
      });
    }
    console.log(`🔗 Linked ${deptQuestions.length} questions to exam "${exam.title}" (${examData.deptCode})`);
  }

  console.log("🎉 Database seeding complete! All academic departments now have active questions and examinations.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
