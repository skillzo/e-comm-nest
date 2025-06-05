import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColums1749048438211 implements MigrationInterface {
    name = 'UpdateColums1749048438211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_active" character varying NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted_at"`);
    }

}
