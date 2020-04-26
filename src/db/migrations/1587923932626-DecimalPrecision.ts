import {MigrationInterface, QueryRunner} from "typeorm";

export class DecimalPrecision1587923932626 implements MigrationInterface {
    name = 'DecimalPrecision1587923932626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` CHANGE `rating` `rating` decimal(3,2) NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book` CHANGE `rating` `rating` decimal(10,0) NULL", undefined);
    }

}
