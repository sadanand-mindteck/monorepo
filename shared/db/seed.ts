// import { db } from "./connection.js"
// import { users, organizations, examinations, examCenters, jammers } from "./schema"
// import bcrypt from "bcryptjs"

// async function seedDatabase() {
//   try {
//     console.log("Seeding database...")

//     // Create organizations
//     const [warehouse1, warehouse2, agency1, agency2] = await db
//       .insert(organizations)
//       .values([
//         {
//           name: "Delhi Central Warehouse",
//           type: "warehouse",
//           location: "New Delhi",
//           contactEmail: "warehouse.delhi@example.com",
//           contactPhone: "+91-9876543210",
//           capacity: "3000 units",
//         },
//         {
//           name: "Mumbai Storage Facility",
//           type: "warehouse",
//           location: "Mumbai",
//           contactEmail: "warehouse.mumbai@example.com",
//           contactPhone: "+91-9876543211",
//           capacity: "2500 units",
//         },
//         {
//           name: "SecureInstall Services",
//           type: "installation_agency",
//           location: "Pan India",
//           contactEmail: "ops@secureinstall.com",
//           contactPhone: "+91-9876543212",
//           capacity: "50 operators",
//         },
//         {
//           name: "TechGuard Solutions",
//           type: "installation_agency",
//           location: "North India",
//           contactEmail: "support@techguard.com",
//           contactPhone: "+91-9876543213",
//           capacity: "30 operators",
//         },
//       ])
//       .returning()

//     // Create users
//     const hashedPassword = await bcrypt.hash("password123", 10)

//     const [admin, warehouseUser, operator1, operator2] = await db
//       .insert(users)
//       .values([
//         {
//           email: "admin@bel.co.in",
//           password: hashedPassword,
//           name: "BEL Administrator",
//           role: "admin",
//         },
//         {
//           email: "warehouse@example.com",
//           password: hashedPassword,
//           name: "Warehouse Operator",
//           role: "warehouse",
//           organizationId: warehouse1.id,
//         },
//         {
//           email: "operator1@example.com",
//           password: hashedPassword,
//           name: "Field Operator 1",
//           role: "operator",
//           organizationId: agency1.id,
//         },
//         {
//           email: "operator2@example.com",
//           password: hashedPassword,
//           name: "Field Operator 2",
//           role: "operator",
//           organizationId: agency2.id,
//         },
//       ])
//       .returning()

//     // Create examinations
//     const [exam1, exam2] = await db
//       .insert(examinations)
//       .values([
//         {
//           name: "Engineering Entrance Exam 2024",
//           examCode: "EX-2024-001",
//           examDate: new Date("2024-02-15"),
//           status: "active",
//           totalCenters: 2,
//           totalJammersRequired: 24,
//           createdBy: admin.id,
//         },
//         {
//           name: "Medical College Admission Test",
//           examCode: "EX-2024-002",
//           examDate: new Date("2024-02-20"),
//           status: "planning",
//           totalCenters: 1,
//           totalJammersRequired: 12,
//           createdBy: admin.id,
//         },
//       ])
//       .returning()

//     // Create exam centers
//     const [center1, center2, center3] = await db
//       .insert(examCenters)
//       .values([
//         {
//           examinationId: exam1.id,
//           name: "Government College, Sector 5",
//           address: "Sector 5, Dwarka, New Delhi - 110075",
//           latitude: "28.5921",
//           longitude: "77.0460",
//           jammersRequired: 12,
//           assignedAgencyId: agency1.id,
//           assignedOperatorId: operator1.id,
//           reportingTime: "07:00",
//           examStartTime: "10:00",
//         },
//         {
//           examinationId: exam1.id,
//           name: "Central University",
//           address: "Central University Campus, New Delhi - 110067",
//           latitude: "28.6139",
//           longitude: "77.2090",
//           jammersRequired: 12,
//           assignedAgencyId: agency2.id,
//           assignedOperatorId: operator2.id,
//           reportingTime: "07:30",
//           examStartTime: "10:00",
//         },
//         {
//           examinationId: exam2.id,
//           name: "Technical Institute",
//           address: "Technical Institute, Mumbai - 400001",
//           latitude: "19.0760",
//           longitude: "72.8777",
//           jammersRequired: 12,
//           assignedAgencyId: agency1.id,
//           assignedOperatorId: operator1.id,
//           reportingTime: "08:00",
//           examStartTime: "10:30",
//         },
//       ])
//       .returning()

//     // Create jammers
//     const jammerData = []
//     for (let i = 1; i <= 50; i++) {
//       let status;
//       if (i > 45) {
//         status = "faulty";
//       } else if (i > 40) {
//         status = "in_transit";
//       } else {
//         status = "ok";
//       }
//       jammerData.push({
//         serialNumber: `JM-2024-${i.toString().padStart(3, "0")}`,
//         model: i % 3 === 0 ? "SecureBlock Max" : i % 2 === 0 ? "SecureBlock Pro" : "SecureBlock Lite",
//         status,
//         batteryLevel: Math.floor(Math.random() * 100) + 1,
//         currentLocationId: i % 2 === 0 ? warehouse1.id : warehouse2.id,
//         lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
//       })
//     }

//     await db.insert(jammers).values(jammerData)

//     console.log("Database seeded successfully!")
//   } catch (error) {
//     console.error("Seeding failed:", error)
//   }
// }

// seedDatabase()
