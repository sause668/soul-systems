-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('WORKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('QUEUED', 'ACTIVE', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(128) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(120) NOT NULL,
    "lastName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'WORKER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprints" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "partNumber" VARCHAR(120) NOT NULL,
    "timeEstimatePerUnit" INTEGER NOT NULL,

    CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processBlueprints" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "blueprintId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "processInstructions" TEXT NOT NULL,
    "timeEstimatePerUnit" INTEGER NOT NULL,
    "quantityCompleted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "processBlueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issueBlueprints" (
    "id" SERIAL NOT NULL,
    "processBlueprintId" INTEGER NOT NULL,
    "partNumber" VARCHAR(120) NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,

    CONSTRAINT "issueBlueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "blueprintId" INTEGER NOT NULL,
    "numOfUnits" INTEGER NOT NULL,
    "timeCompletionPerUnit" INTEGER NOT NULL DEFAULT 0,
    "dueDate" DATE NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processes" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "timeCompletionPerUnit" INTEGER NOT NULL DEFAULT 0,
    "status" "ProcessStatus" NOT NULL DEFAULT 'QUEUED',
    "order" INTEGER NOT NULL,
    "processBlueprintId" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "actualMinutes" INTEGER,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issueJobs" (
    "id" SERIAL NOT NULL,
    "processId" INTEGER NOT NULL,
    "partNumber" VARCHAR(120) NOT NULL,
    "quantityIssued" INTEGER NOT NULL,

    CONSTRAINT "issueJobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPart" (
    "id" SERIAL NOT NULL,
    "partNumber" VARCHAR(120) NOT NULL,
    "quantityStocked" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" VARCHAR(160) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "workers_userId_idx" ON "workers"("userId");

-- CreateIndex
CREATE INDEX "workers_departmentId_idx" ON "workers"("departmentId");

-- CreateIndex
CREATE INDEX "admins_userId_idx" ON "admins"("userId");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE INDEX "blueprints_customerId_idx" ON "blueprints"("customerId");

-- CreateIndex
CREATE INDEX "blueprints_partNumber_idx" ON "blueprints"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "blueprints_customerId_partNumber_key" ON "blueprints"("customerId", "partNumber");

-- CreateIndex
CREATE INDEX "processBlueprints_blueprintId_order_idx" ON "processBlueprints"("blueprintId", "order");

-- CreateIndex
CREATE INDEX "processBlueprints_departmentId_idx" ON "processBlueprints"("departmentId");

-- CreateIndex
CREATE INDEX "issueBlueprints_processBlueprintId_idx" ON "issueBlueprints"("processBlueprintId");

-- CreateIndex
CREATE INDEX "issueBlueprints_partNumber_idx" ON "issueBlueprints"("partNumber");

-- CreateIndex
CREATE INDEX "Job_blueprintId_idx" ON "Job"("blueprintId");

-- CreateIndex
CREATE INDEX "Job_dueDate_idx" ON "Job"("dueDate");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "processes_departmentId_status_idx" ON "processes"("departmentId", "status");

-- CreateIndex
CREATE INDEX "processes_jobId_idx" ON "processes"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "processes_jobId_order_key" ON "processes"("jobId", "order");

-- CreateIndex
CREATE INDEX "issueJobs_processId_idx" ON "issueJobs"("processId");

-- CreateIndex
CREATE INDEX "issueJobs_partNumber_idx" ON "issueJobs"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StockPart_partNumber_key" ON "StockPart"("partNumber");

-- CreateIndex
CREATE INDEX "StockPart_partNumber_idx" ON "StockPart"("partNumber");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processBlueprints" ADD CONSTRAINT "processBlueprints_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processBlueprints" ADD CONSTRAINT "processBlueprints_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issueBlueprints" ADD CONSTRAINT "issueBlueprints_processBlueprintId_fkey" FOREIGN KEY ("processBlueprintId") REFERENCES "processBlueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_processBlueprintId_fkey" FOREIGN KEY ("processBlueprintId") REFERENCES "processBlueprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issueJobs" ADD CONSTRAINT "issueJobs_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
