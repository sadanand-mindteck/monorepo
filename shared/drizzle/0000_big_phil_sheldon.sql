-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."exam_status" AS ENUM('draft', 'planning', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('image', 'document', 'certificate', 'report');--> statement-breakpoint
CREATE TYPE "public"."jammer_status" AS ENUM('ok', 'faulty', 'in_transit', 'deployed', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."mfa_method" AS ENUM('email', 'sms', 'totp');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('warehouse', 'installation_agency');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'in_transit', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'warehouse', 'operator');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"details" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"examination_id" integer,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"latitude" integer NOT NULL,
	"longitude" integer NOT NULL,
	"jammers_required" integer NOT NULL,
	"assigned_agency_id" integer,
	"assigned_operator_id" integer,
	"reporting_time" timestamp NOT NULL,
	"exam_start_time" timestamp NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "examinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"exam_code" varchar(50) NOT NULL,
	"exam_date" timestamp NOT NULL,
	"status" "exam_status" DEFAULT 'draft' NOT NULL,
	"total_centers" integer DEFAULT 0,
	"total_jammers_required" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "examinations_exam_code_unique" UNIQUE("exam_code")
);

*/