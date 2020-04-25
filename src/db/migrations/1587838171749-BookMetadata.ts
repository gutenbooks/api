import {MigrationInterface, QueryRunner} from "typeorm";

export class BookMetadata1587838171749 implements MigrationInterface {
    name = 'BookMetadata1587838171749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` ADD `description` varchar(255) NOT NULL DEFAULT ''", undefined);
        await queryRunner.query("ALTER TABLE `book` ADD `ratings` varchar(255) NOT NULL DEFAULT ''", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `ratings`", undefined);
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `description`", undefined);
    }

}
