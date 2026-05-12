-- AlterTable
ALTER TABLE `refresh_tokens` ADD COLUMN `admin_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `refresh_tokens_admin_id_idx` ON `refresh_tokens`(`admin_id`);

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `administrators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
