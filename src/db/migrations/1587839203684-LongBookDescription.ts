import {MigrationInterface, QueryRunner} from "typeorm";

export class LongBookDescription1587839203684 implements MigrationInterface {
    name = 'LongBookDescription1587839203684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `description`", undefined);
        await queryRunner.query("ALTER TABLE `book` ADD `description` longtext NOT NULL DEFAULT ''", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `description`", undefined);
        await queryRunner.query("ALTER TABLE `book` ADD `description` varchar(255) NOT NULL DEFAULT ''", undefined);
    }

}
