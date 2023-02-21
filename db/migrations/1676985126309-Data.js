module.exports = class Data1676985126309 {
    name = 'Data1676985126309'

    async up(db) {
        await db.query(`CREATE TABLE "transaction" ("id" character varying NOT NULL, "nonce" integer NOT NULL, "result" boolean NOT NULL, "block_number" integer NOT NULL, "timestamp" integer NOT NULL, "account_id" character varying, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_e2652fa8c16723c83a00fb9b17" ON "transaction" ("account_id") `)
        await db.query(`CREATE INDEX "IDX_b9bc09c9b4ab20a5f3150bf82d" ON "transaction" ("nonce") `)
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "tx_count" integer NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "transaction"`)
        await db.query(`DROP INDEX "public"."IDX_e2652fa8c16723c83a00fb9b17"`)
        await db.query(`DROP INDEX "public"."IDX_b9bc09c9b4ab20a5f3150bf82d"`)
        await db.query(`DROP TABLE "account"`)
        await db.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e"`)
    }
}
