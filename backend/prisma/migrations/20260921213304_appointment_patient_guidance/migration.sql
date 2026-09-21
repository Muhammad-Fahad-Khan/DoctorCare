-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `guidanceUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `guidanceUrgent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `patientGuidance` TEXT NULL;
