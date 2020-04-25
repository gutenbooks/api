import {MigrationInterface, QueryRunner} from "typeorm";

export class Rating1587843675428 implements MigrationInterface {
    name = 'Rating1587843675428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` CHANGE `ratings` `rating` varchar(255) NOT NULL DEFAULT ''", undefined);
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `rating`", undefined);
        await queryRunner.query("ALTER TABLE `book` ADD `rating` decimal NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` DROP COLUMN `rating`", undefined);
        await queryRunner.query("ALTER TABLE `book` ADD `rating` varchar(255) NOT NULL DEFAULT ''", undefined);
        await queryRunner.query("ALTER TABLE `book` CHANGE `rating` `ratings` varchar(255) NOT NULL DEFAULT ''", undefined);
    }

}
