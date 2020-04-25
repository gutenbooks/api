import {MigrationInterface, QueryRunner} from "typeorm";

export class IdentifierTypeIdx1587836778081 implements MigrationInterface {
    name = 'IdentifierTypeIdx1587836778081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_1f46f02b538b130288d1777f5f` ON `identifier`", undefined);
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_00f1dc27fdd66f354398f78cf9` ON `identifier` (`entity_type`, `source`, `type`, `value`)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_00f1dc27fdd66f354398f78cf9` ON `identifier`", undefined);
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_1f46f02b538b130288d1777f5f` ON `identifier` (`source`, `type`, `value`)", undefined);
    }

}
