import {MigrationInterface, QueryRunner} from "typeorm";

export class Identifiers1587820267379 implements MigrationInterface {
    name = 'Identifiers1587820267379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `identifier` ADD `source` enum ('project_gutenberg', 'goodreads', 'global') NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD `book_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD `entity_type` varchar(255) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_18b735ac99ef858ad5808c88ff4`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` CHANGE `type` `type` enum ('isbn', 'isbn13', 'internal') NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` CHANGE `edition_id` `edition_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_049e35263dea76eb1781e0f1476`", undefined);
        await queryRunner.query("ALTER TABLE `edition` CHANGE `language_id` `language_id` bigint NOT NULL", undefined);
        await queryRunner.query("CREATE INDEX `IDX_d8d5883a07f381e96a35bb7546` ON `identifier` (`entity_type`)", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_18b735ac99ef858ad5808c88ff4` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_54b557a3cf84a55a4ff3399e000` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_049e35263dea76eb1781e0f1476` FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_049e35263dea76eb1781e0f1476`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_54b557a3cf84a55a4ff3399e000`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_18b735ac99ef858ad5808c88ff4`", undefined);
        await queryRunner.query("DROP INDEX `IDX_d8d5883a07f381e96a35bb7546` ON `identifier`", undefined);
        await queryRunner.query("ALTER TABLE `edition` CHANGE `language_id` `language_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_049e35263dea76eb1781e0f1476` FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `identifier` CHANGE `edition_id` `edition_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` CHANGE `type` `type` enum ('project_gutenberg', 'goodreads', 'isbn') NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_18b735ac99ef858ad5808c88ff4` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP COLUMN `entity_type`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP COLUMN `book_id`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP COLUMN `source`", undefined);
    }

}
