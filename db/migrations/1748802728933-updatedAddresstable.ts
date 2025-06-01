import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAddresstable1748802728933 implements MigrationInterface {
    name = 'UpdatedAddresstable1748802728933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" RENAME COLUMN "street_address" TO "street"`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "type" SET DEFAULT 'shipping'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "address" RENAME COLUMN "street" TO "street_address"`);
    }

}
