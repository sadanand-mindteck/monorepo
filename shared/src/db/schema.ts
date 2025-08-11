import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, pgEnum, AnyPgColumn, date } from "drizzle-orm/pg-core"

// Enums
const userRoleEnum = pgEnum("user_role", ["admin", "warehouse", "operator"])
const jammerStatusEnum = pgEnum("jammer_status", ["ok", "faulty", "in_transit", "deployed", "maintenance"])
const shipmentStatusEnum = pgEnum("shipment_status", ["pending", "in_transit", "delivered", "cancelled"])
const examStatusEnum = pgEnum("exam_status", ["draft", "planning", "active", "completed", "cancelled"])
const organizationTypeEnum = pgEnum("organization_type", ["warehouse", "installation_agency"])
const mfaMethodEnum = pgEnum("mfa_method", ["email", "sms", "totp"])
const fileTypeEnum = pgEnum("file_type", ["image", "document", "certificate", "report"])
const taskTypeEnum =pgEnum("task_type", ["attendance", "receive", "install", "power_on", "upload_cert", "power_off"])
const installationTaskStatusEnum = pgEnum("installation_task_status", ["pending", "completed"])
const entityTypeEnum = pgEnum("entityType",["jammer", "shipment", "installation"])
// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethod: mfaMethodEnum("mfa_method"),
  mfaSecret: varchar("mfa_secret", { length: 255 }),
  lastLogin: timestamp("last_login"),
  createdBy: integer("created_by").references(():any=> users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// MFA Tokens table
export const mfaTokens = pgTable("mfa_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  token: varchar("token", { length: 10 }).notNull(),
  method: mfaMethodEnum("method").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: organizationTypeEnum("type").notNull(),
  address: varchar("location", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Examinations table
export const examinations = pgTable("examinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  examCode: varchar("exam_code", { length: 50 }).notNull().unique(),
  examDate: timestamp("exam_date").notNull(),
  status: examStatusEnum("status").default("draft").notNull(),
  totalCenters: integer("total_centers").default(0),
  totalJammersRequired: integer("total_jammers_required").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Exam Centers table
export const examCenters = pgTable("exam_centers", {
  id: serial("id").primaryKey().unique(),
  examinationId: integer("examination_id").references(() => examinations.id),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: integer("latitude").notNull(),
  longitude: integer("longitude").notNull(),
  jammersRequired: integer("jammers_required").notNull(),
  assignedAgencyId: integer("assigned_agency_id").references(() => organizations.id),
  assignedOperatorId: integer("assigned_operator_id").references(() => users.id),
  reportingTime: timestamp("reporting_time").notNull(),
  examStartTime: timestamp("exam_start_time").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Jammers table
export const jammers = pgTable("jammers", {
  id: serial("id").primaryKey().notNull(),
  serialNumber: varchar("serial_number", { length: 50 }).notNull().unique(),
  model: varchar("model", { length: 100 }).notNull(),
  status: jammerStatusEnum("status").default("ok").notNull(),
  currentLocationId: integer("current_location_id").references(() => organizations.id),
  assignedCenterId: integer("assigned_center_id").references(() => examCenters.id),
  lastMaintenance: timestamp("last_maintenance"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Shipments table
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  shipmentCode: varchar("shipment_code", { length: 50 }).notNull().unique(),
  fromLocationId: integer("from_location_id").references(() => organizations.id),
  toLocationId: integer("to_location_id").references(() => organizations.id),
  toCenterId: integer("to_center_id").references(() => examCenters.id),
  status: shipmentStatusEnum("status").default("pending").notNull(),
  docketNumber: varchar("docket_number", { length: 100 }),
  totalJammers: integer("total_jammers").default(0),
  dispatchedAt: timestamp("dispatched_at"),
  deliveredAt: timestamp("delivered_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Shipment Items table
export const shipmentItems = pgTable("shipment_items", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  jammerId: integer("jammer_id").references(() => jammers.id),
  createdAt: timestamp("created_at").defaultNow(),
})

// Installation Tasks table
export const installationTasks = pgTable("installation_tasks", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").references(() => examCenters.id),
  operatorId: integer("operator_id").references(() => users.id),
  taskType: taskTypeEnum().notNull(), // attendance, receive, install, power_on, upload_cert, power_off
  status: installationTaskStatusEnum().notNull().default("pending"), // pending, completed
  completedAt: timestamp("completed_at"),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
  gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  photoUrl: varchar("photo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  type: fileTypeEnum("type").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  entityType: entityTypeEnum().notNull(), // jammer, shipment, installation, etc.
  createdAt: timestamp("created_at").defaultNow(),
})

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
})
