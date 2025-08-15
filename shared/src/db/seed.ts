import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { db, sql } from "./connection.js"; // your connection.ts/js
import * as schema from "./schema.js";

dotenv.config();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear tables in correct order (manual since drizzle-seed's reset not used)
  await db.delete(schema.activityLogs);
  await db.delete(schema.files);
  await db.delete(schema.installationTasks);
  await db.delete(schema.shipmentItems);
  await db.delete(schema.shipments);
  await db.delete(schema.jammers);
  await db.delete(schema.examCenters);
  await db.delete(schema.examinations);
  await db.delete(schema.users);
  await db.delete(schema.organizations);

  // --- Organizations ---
  const orgData = Array.from({ length: 4 }, () => ({
    name: faker.company.name(),
    type: faker.helpers.arrayElement(["warehouse", "installation_agency"]),
    address: faker.location.city(),
    contactEmail: faker.internet.email(),
    contactPhone: faker.phone.number({ style: "national" }),
    capacity: faker.number.int({ min: 100, max: 5000 }),
    isActive: true,
  }));

  const insertedOrgs = await db.insert(schema.organizations).values(orgData).returning();
  console.log(`✅ Inserted ${insertedOrgs.length} organizations`);

  // --- Users ---
  const hashedPassword = await bcrypt.hash("password123", 10);
  const userData = Array.from({ length: 6 }, () => ({
    email: faker.internet.email(),
    password: hashedPassword,
    name: faker.person.fullName(),
    phone: faker.phone.number({ style: "national" }),
    role: faker.helpers.arrayElement(["admin", "warehouse", "operator"]),
    organizationId: faker.helpers.arrayElement(insertedOrgs).id,
    isActive: true,
    emailVerified: faker.datatype.boolean(),
    phoneVerified: faker.datatype.boolean(),
  }));

  const insertedUsers = await db.insert(schema.users).values(userData).returning();
  console.log(`✅ Inserted ${insertedUsers.length} users`);

  // --- Examinations ---
  const examData = Array.from({ length: 2 }, () => ({
    name: faker.commerce.productName() + " Exam",
    examCode: `EX-${faker.number.int({ min: 1000, max: 9999 })}`,
    examDate: faker.date.future(),
    status: faker.helpers.arrayElement(["planning", "active", "draft"]),
    totalCenters: faker.number.int({ min: 1, max: 5 }),
    totalJammersRequired: faker.number.int({ min: 5, max: 50 }),
    createdBy: faker.helpers.arrayElement(insertedUsers).id,
  }));

  const insertedExams = await db.insert(schema.examinations).values(examData).returning();
  console.log(`✅ Inserted ${insertedExams.length} examinations`);

  // --- Exam Centers ---
  const centerData = Array.from({ length: 3 }, () => ({
    examinationId: faker.helpers.arrayElement(insertedExams).id,
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    latitude: faker.location.latitude({ min: -90, max: 90 }).toString(),
    longitude: faker.location.longitude({ min: 77, max: 77 }).toString(),

    jammersRequired: faker.number.int({ min: 5, max: 20 }),
    assignedAgencyId: faker.helpers.arrayElement(insertedOrgs).id,
    assignedOperatorId: faker.helpers.arrayElement(insertedUsers).id,
    reportingTime: faker.date.future(),
    examStartTime: faker.date.future(),
  }));

  const insertedCenters = await db.insert(schema.examCenters).values(centerData).returning();
  console.log(`✅ Inserted ${insertedCenters.length} exam centers`);

  // --- Jammers ---
  const jammerData = Array.from({ length: 50 }, (_, i) => ({
    serialNumber: `JM-2024-${(i + 1).toString().padStart(3, "0")}`,
    model: faker.helpers.arrayElement(["SecureBlock Max", "SecureBlock Pro", "SecureBlock Lite"]),
    status: faker.helpers.arrayElement(["ok", "faulty", "in_transit", "deployed", "maintenance"]),
    currentLocationId: faker.helpers.arrayElement(insertedOrgs).id,
    lastMaintenance: faker.date.past({ years: 1 }),
  }));

  await db.insert(schema.jammers).values(jammerData);
  console.log(`✅ Inserted ${jammerData.length} jammers`);

  console.log("🎉 Seed completed successfully!");
  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  sql.end({ timeout: 5 });
});
