import {MigrationInterface, QueryRunner} from "typeorm";

export class Subtitle1587001978278 implements MigrationInterface {
    name = 'Subtitle1587001978278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` ADD `subtitle` longtext NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_c277caf82966ef1c123cac79e1f`", undefined);
        await queryRunner.query("ALTER TABLE `edition` CHANGE `book_id` `book_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP COLUMN `subtitle`", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD `subtitle` longtext NULL", undefined);
        await queryRunner.query("ALTER TABLE `taxon` DROP FOREIGN KEY `FK_f847687f0f7ca2cdcbd941cfe2b`", undefined);
        await queryRunner.query("ALTER TABLE `taxon` CHANGE `taxonomy_id` `taxonomy_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_c277caf82966ef1c123cac79e1f` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `taxon` ADD CONSTRAINT `FK_f847687f0f7ca2cdcbd941cfe2b` FOREIGN KEY (`taxonomy_id`) REFERENCES `taxonomy`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `taxon` DROP FOREIGN KEY `FK_f847687f0f7ca2cdcbd941cfe2b`", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_c277caf82966ef1c123cac79e1f`", undefined);
        await queryRunner.query("ALTER TABLE `taxon` CHANGE `taxonomy_id` `taxonomy_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `taxon` ADD CONSTRAINT `FK_f847687f0f7ca2cdcbd941cfe2b` FOREIGN KEY (`taxonomy_id`) REFERENCES `taxonomy`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP COLUMN `subtitle`", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD `subtitle` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` CHANGE `book_id` `book_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_c277caf82966ef1c123cac79e1f` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `subtitle`", undefined);
    }

}
