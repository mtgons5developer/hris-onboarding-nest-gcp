-- CreateSchema
CREATE TYPE "UserRole" AS ENUM ('hr_admin', 'manager', 'employee', 'system_admin');
CREATE TYPE "EmployeeStatus" AS ENUM ('candidate', 'active', 'terminated');
CREATE TYPE "OfferStatus" AS ENUM ('draft', 'sent', 'accepted', 'withdrawn');
CREATE TYPE "CaseStatus" AS ENUM ('invited', 'in_progress', 'pending_hr', 'completed', 'cancelled');
CREATE TYPE "TaskAssigneeRole" AS ENUM ('employee', 'manager', 'hr');
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'done', 'waived', 'rejected');
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "employee_id" TEXT,
    "tenant_id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "work_email" TEXT NOT NULL,
    "manager_employee_id" TEXT,
    "department" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'candidate',
    "hired_at" TIMESTAMP(3),
    "tenant_id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'draft',
    "created_by_user_id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "onboarding_cases" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "offer_id" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'invited',
    "invited_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "tenant_id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_cases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "onboarding_tasks" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignee_role" "TaskAssigneeRole" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents_meta" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "task_id" TEXT,
    "gcs_bucket" TEXT NOT NULL,
    "gcs_object_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "uploaded_by_user_id" TEXT NOT NULL,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_meta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");
CREATE INDEX "users_firebase_uid_idx" ON "users"("firebase_uid");

CREATE UNIQUE INDEX "employees_employee_number_key" ON "employees"("employee_number");
CREATE UNIQUE INDEX "employees_work_email_key" ON "employees"("work_email");

CREATE INDEX "onboarding_cases_status_idx" ON "onboarding_cases"("status");
CREATE INDEX "onboarding_tasks_case_id_idx" ON "onboarding_tasks"("case_id");
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_employee_id_fkey" FOREIGN KEY ("manager_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "onboarding_cases" ADD CONSTRAINT "onboarding_cases_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "onboarding_cases" ADD CONSTRAINT "onboarding_cases_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "onboarding_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents_meta" ADD CONSTRAINT "documents_meta_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "onboarding_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents_meta" ADD CONSTRAINT "documents_meta_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "onboarding_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents_meta" ADD CONSTRAINT "documents_meta_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
