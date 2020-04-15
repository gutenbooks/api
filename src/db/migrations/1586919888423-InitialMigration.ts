import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1586919888423 implements MigrationInterface {
    name = 'InitialMigration1586919888423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER DATABASE CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_bin'", undefined);
        await queryRunner.query("CREATE TABLE `contributor` (`id` bigint NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `sort_name` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `contribution` (`id` int NOT NULL AUTO_INCREMENT, `type` enum ('author', 'editor', 'illustrator') NOT NULL, `contributor_id` bigint NOT NULL, `priority` int NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `book_id` bigint NULL, `work_type` varchar(255) NOT NULL, `edition_id` bigint NULL, INDEX `IDX_7726ea6c0f889b8af345f30dd5` (`work_type`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `format` (`id` bigint NOT NULL AUTO_INCREMENT, `type` enum ('epub', 'kindle', 'text', 'html', 'pdf') NOT NULL, `file` varchar(255) NOT NULL, `description` varchar(255) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `edition_id` bigint NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `identifier` (`id` bigint NOT NULL AUTO_INCREMENT, `type` enum ('project_gutenberg', 'goodreads', 'isbn') NOT NULL, `value` varchar(255) NOT NULL, `edition_id` bigint NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `language` (`id` bigint NOT NULL AUTO_INCREMENT, `code` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `native_name` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_465b3173cdddf0ac2d3fe73a33` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `edition` (`id` bigint NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `subtitle` varchar(255) NULL, `downloads` int NOT NULL, `published_at` datetime NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `book_id` bigint NULL, `language_id` bigint NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `taxonomy` (`id` bigint NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `taxon` (`id` bigint NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `taxonomy_id` bigint NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `book` (`id` bigint NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `book_taxons_taxon` (`book_id` bigint NOT NULL, `taxon_id` bigint NOT NULL, INDEX `IDX_f7f67ccbb6d5837de37e7d6a8d` (`book_id`), INDEX `IDX_fc305a1da5fd27790fe1863c42` (`taxon_id`), PRIMARY KEY (`book_id`, `taxon_id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `contribution` ADD CONSTRAINT `FK_2dbb170adc1fcfdd1061e5efe57` FOREIGN KEY (`contributor_id`) REFERENCES `contributor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `contribution` ADD CONSTRAINT `FK_5ddb4fdd00de66b657c74683084` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `contribution` ADD CONSTRAINT `FK_985917275a8ff95f4faaa5d211e` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `format` ADD CONSTRAINT `FK_aeced9253169ba60588f20baadc` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `identifier` ADD CONSTRAINT `FK_18b735ac99ef858ad5808c88ff4` FOREIGN KEY (`edition_id`) REFERENCES `edition`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_c277caf82966ef1c123cac79e1f` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `edition` ADD CONSTRAINT `FK_049e35263dea76eb1781e0f1476` FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `taxon` ADD CONSTRAINT `FK_f847687f0f7ca2cdcbd941cfe2b` FOREIGN KEY (`taxonomy_id`) REFERENCES `taxonomy`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `book_taxons_taxon` ADD CONSTRAINT `FK_f7f67ccbb6d5837de37e7d6a8d2` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `book_taxons_taxon` ADD CONSTRAINT `FK_fc305a1da5fd27790fe1863c42f` FOREIGN KEY (`taxon_id`) REFERENCES `taxon`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `book_taxons_taxon` DROP FOREIGN KEY `FK_fc305a1da5fd27790fe1863c42f`", undefined);
        await queryRunner.query("ALTER TABLE `book_taxons_taxon` DROP FOREIGN KEY `FK_f7f67ccbb6d5837de37e7d6a8d2`", undefined);
        await queryRunner.query("ALTER TABLE `taxon` DROP FOREIGN KEY `FK_f847687f0f7ca2cdcbd941cfe2b`", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_049e35263dea76eb1781e0f1476`", undefined);
        await queryRunner.query("ALTER TABLE `edition` DROP FOREIGN KEY `FK_c277caf82966ef1c123cac79e1f`", undefined);
        await queryRunner.query("ALTER TABLE `identifier` DROP FOREIGN KEY `FK_18b735ac99ef858ad5808c88ff4`", undefined);
        await queryRunner.query("ALTER TABLE `format` DROP FOREIGN KEY `FK_aeced9253169ba60588f20baadc`", undefined);
        await queryRunner.query("ALTER TABLE `contribution` DROP FOREIGN KEY `FK_985917275a8ff95f4faaa5d211e`", undefined);
        await queryRunner.query("ALTER TABLE `contribution` DROP FOREIGN KEY `FK_5ddb4fdd00de66b657c74683084`", undefined);
        await queryRunner.query("ALTER TABLE `contribution` DROP FOREIGN KEY `FK_2dbb170adc1fcfdd1061e5efe57`", undefined);
        await queryRunner.query("DROP INDEX `IDX_fc305a1da5fd27790fe1863c42` ON `book_taxons_taxon`", undefined);
        await queryRunner.query("DROP INDEX `IDX_f7f67ccbb6d5837de37e7d6a8d` ON `book_taxons_taxon`", undefined);
        await queryRunner.query("DROP TABLE `book_taxons_taxon`", undefined);
        await queryRunner.query("DROP TABLE `book`", undefined);
        await queryRunner.query("DROP TABLE `taxon`", undefined);
        await queryRunner.query("DROP TABLE `taxonomy`", undefined);
        await queryRunner.query("DROP TABLE `edition`", undefined);
        await queryRunner.query("DROP INDEX `IDX_465b3173cdddf0ac2d3fe73a33` ON `language`", undefined);
        await queryRunner.query("DROP TABLE `language`", undefined);
        await queryRunner.query("DROP TABLE `identifier`", undefined);
        await queryRunner.query("DROP TABLE `format`", undefined);
        await queryRunner.query("DROP INDEX `IDX_7726ea6c0f889b8af345f30dd5` ON `contribution`", undefined);
        await queryRunner.query("DROP TABLE `contribution`", undefined);
        await queryRunner.query("DROP TABLE `contributor`", undefined);
    }

}
