-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LoanApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BureauRequestStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'LOAN_STATUS', 'SECURITY', 'DISBURSEMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenIdentifier" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "deviceInfo" VARCHAR(255),
    "ipAddress" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanProduct" (
    "id" UUID NOT NULL,
    "productName" VARCHAR(150) NOT NULL,
    "minAmount" DECIMAL(14,2) NOT NULL,
    "maxAmount" DECIMAL(14,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "minTenure" INTEGER NOT NULL,
    "maxTenure" INTEGER NOT NULL,
    "eligibilityRules" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanApplication" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "loanProductId" UUID NOT NULL,
    "requestedAmount" DECIMAL(14,2) NOT NULL,
    "requestedTenure" INTEGER NOT NULL,
    "employmentType" VARCHAR(100) NOT NULL,
    "employerName" VARCHAR(200),
    "monthlyIncome" DECIMAL(14,2) NOT NULL,
    "existingObligations" DECIMAL(14,2) NOT NULL,
    "status" "LoanApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityAssessment" (
    "id" UUID NOT NULL,
    "loanApplicationId" UUID NOT NULL,
    "eligibilityResult" BOOLEAN NOT NULL,
    "approvalProbability" DECIMAL(5,4) NOT NULL,
    "debtToIncomeRatio" DECIMAL(5,4) NOT NULL,
    "reasons" JSONB NOT NULL,
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EligibilityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "creditScore" INTEGER NOT NULL,
    "creditSummary" JSONB NOT NULL,
    "bureauReference" VARCHAR(100) NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditBureauRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "BureauRequestStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" VARCHAR(255),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditBureauRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDecision" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "decisionReason" VARCHAR(500) NOT NULL,
    "reviewedBy" UUID NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDisbursement" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "disbursedBy" UUID NOT NULL,
    "disbursedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNumber" VARCHAR(100) NOT NULL,

    CONSTRAINT "LoanDisbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "actionType" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "metadata" JSONB NOT NULL,
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(150) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" UUID NOT NULL,
    "key" VARCHAR(150) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenIdentifier_key" ON "RefreshToken"("tokenIdentifier");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_idx" ON "RefreshToken"("revoked");

-- CreateIndex
CREATE INDEX "LoanProduct_active_idx" ON "LoanProduct"("active");

-- CreateIndex
CREATE INDEX "LoanApplication_userId_idx" ON "LoanApplication"("userId");

-- CreateIndex
CREATE INDEX "LoanApplication_loanProductId_idx" ON "LoanApplication"("loanProductId");

-- CreateIndex
CREATE INDEX "LoanApplication_status_idx" ON "LoanApplication"("status");

-- CreateIndex
CREATE INDEX "LoanApplication_submittedAt_idx" ON "LoanApplication"("submittedAt");

-- CreateIndex
CREATE INDEX "LoanApplication_deletedAt_idx" ON "LoanApplication"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityAssessment_loanApplicationId_key" ON "EligibilityAssessment"("loanApplicationId");

-- CreateIndex
CREATE INDEX "CreditReport_userId_idx" ON "CreditReport"("userId");

-- CreateIndex
CREATE INDEX "CreditReport_retrievedAt_idx" ON "CreditReport"("retrievedAt");

-- CreateIndex
CREATE INDEX "CreditBureauRequest_userId_idx" ON "CreditBureauRequest"("userId");

-- CreateIndex
CREATE INDEX "CreditBureauRequest_status_idx" ON "CreditBureauRequest"("status");

-- CreateIndex
CREATE INDEX "CreditBureauRequest_createdAt_idx" ON "CreditBureauRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LoanDecision_applicationId_key" ON "LoanDecision"("applicationId");

-- CreateIndex
CREATE INDEX "LoanDecision_reviewedBy_idx" ON "LoanDecision"("reviewedBy");

-- CreateIndex
CREATE INDEX "LoanDecision_reviewedAt_idx" ON "LoanDecision"("reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LoanDisbursement_applicationId_key" ON "LoanDisbursement"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanDisbursement_referenceNumber_key" ON "LoanDisbursement"("referenceNumber");

-- CreateIndex
CREATE INDEX "LoanDisbursement_disbursedBy_idx" ON "LoanDisbursement"("disbursedBy");

-- CreateIndex
CREATE INDEX "LoanDisbursement_disbursedAt_idx" ON "LoanDisbursement"("disbursedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfiguration_key_key" ON "SystemConfiguration"("key");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_loanProductId_fkey" FOREIGN KEY ("loanProductId") REFERENCES "LoanProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityAssessment" ADD CONSTRAINT "EligibilityAssessment_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditReport" ADD CONSTRAINT "CreditReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBureauRequest" ADD CONSTRAINT "CreditBureauRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDecision" ADD CONSTRAINT "LoanDecision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDisbursement" ADD CONSTRAINT "LoanDisbursement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
