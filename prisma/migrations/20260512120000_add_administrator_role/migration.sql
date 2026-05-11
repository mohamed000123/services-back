-- AlterTable
ALTER TABLE `administrators` ADD COLUMN `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN';

-- Existing rows were created before roles; treat them as super admins so access is preserved.
UPDATE `administrators` SET `role` = 'SUPER_ADMIN';
