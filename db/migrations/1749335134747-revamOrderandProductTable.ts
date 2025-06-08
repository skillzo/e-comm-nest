import { MigrationInterface, QueryRunner } from "typeorm";

export class RevamOrderandProductTable1749335134747 implements MigrationInterface {
    name = 'RevamOrderandProductTable1749335134747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "product_snapshot" jsonb`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "image_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "product_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "product_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "product_snapshot"`);
    }

}
