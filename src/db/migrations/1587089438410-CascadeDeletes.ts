import {MigrationInterface, QueryRunner} from "typeorm";

export class CascadeDeletes1587089438410 implements MigrationInterface {
    name = 'CascadeDeletes1587089438410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `contribution` DROP FOREIGN KEY `FK_985917275a8ff95f4faaa5d211e`", undefined);
        await queryRunner.query("ALTER TABLE `format` DROP FOREIGN KEY `FK_aeced9253169ba60588f20baadc`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_18b735ac99ef858ad5808c88ff4`", undefined);
        await queryRunner.query("ALTER TABLE `format` CHANGE `edition_id` `edition_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `contribution` ADD CONSTRAINT `FK_985917275a8ff95f4faaa5d211e` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `format` ADD CONSTRAINT `FK_aeced9253169ba60588f20baadc` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_18b735ac99ef858ad5808c88ff4` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_18b735ac99ef858ad5808c88ff4`", undefined);
        await queryRunner.query("ALTER TABLE `format` DROP FOREIGN KEY `FK_aeced9253169ba60588f20baadc`", undefined);
        await queryRunner.query("ALTER TABLE `contribution` DROP FOREIGN KEY `FK_985917275a8ff95f4faaa5d211e`", undefined);
        await queryRunner.query("ALTER TABLE `format` CHANGE `edition_id` `edition_id` bigint NULL", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_18b735ac99ef858ad5808c88ff4` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `format` ADD CONSTRAINT `FK_aeced9253169ba60588f20baadc` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `contribution` ADD CONSTRAINT `FK_985917275a8ff95f4faaa5d211e` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

}
