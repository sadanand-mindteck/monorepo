import { pgTable, serial, integer, varchar, text, timestamp, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const examStatus = pgEnum("exam_status", ['draft', 'planning', 'active', 'completed', 'cancelled'])
export const fileType = pgEnum("file_type", ['image', 'document', 'certificate', 'report'])
export const jammerStatus = pgEnum("jammer_status", ['ok', 'faulty', 'in_transit', 'deployed', 'maintenance'])
export const mfaMethod = pgEnum("mfa_method", ['email', 'sms', 'totp'])
export const organizationType = pgEnum("organization_type", ['warehouse', 'installation_agency'])
export const shipmentStatus = pgEnum("shipment_status", ['pending', 'in_transit', 'delivered', 'cancelled'])
export const userRole = pgEnum("user_role", ['admin', 'warehouse', 'operator'])


export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: integer("entity_id"),
	details: text(),
	ipAddress: varchar("ip_address", { length: 45 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const examCenters = pgTable("exam_centers", {
	id: serial().primaryKey().notNull(),
	examinationId: integer("examination_id"),
	name: varchar({ length: 255 }).notNull(),
	address: text().notNull(),
	latitude: integer().notNull(),
	longitude: integer().notNull(),
	jammersRequired: integer("jammers_required").notNull(),
	assignedAgencyId: integer("assigned_agency_id"),
	assignedOperatorId: integer("assigned_operator_id"),
	reportingTime: timestamp("reporting_time", { mode: 'string' }).notNull(),
	examStartTime: timestamp("exam_start_time", { mode: 'string' }).notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const examinations = pgTable("examinations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	examCode: varchar("exam_code", { length: 50 }).notNull(),
	examDate: timestamp("exam_date", { mode: 'string' }).notNull(),
	status: examStatus().default('draft').notNull(),
	totalCenters: integer("total_centers").default(0),
	totalJammersRequired: integer("total_jammers_required").default(0),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("examinations_exam_code_unique").on(table.examCode),
]);
