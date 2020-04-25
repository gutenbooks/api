import {MigrationInterface, QueryRunner} from "typeorm";

export class IdentifierIdx1587836630312 implements MigrationInterface {
    name = 'IdentifierIdx1587836630312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_1f46f02b538b130288d1777f5f` ON `identifier` (`source`, `type`, `value`)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_1f46f02b538b130288d1777f5f` ON `identifier`", undefined);
    }

}
