-- DropForeignKey
ALTER TABLE `productoncart` DROP FOREIGN KEY `ProductOnCart_cartId_fkey`;

-- AddForeignKey
ALTER TABLE `ProductOnCart` ADD CONSTRAINT `ProductOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
