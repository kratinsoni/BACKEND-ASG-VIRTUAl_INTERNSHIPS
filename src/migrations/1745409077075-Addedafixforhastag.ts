import { MigrationInterface, QueryRunner } from "typeorm";

export class Addedafixforhastag1745409077075 implements MigrationInterface {
    name = 'Addedafixforhastag1745409077075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer, CONSTRAINT "FK_8af424a0959fa196e03d4fa7a48" FOREIGN KEY ("autherId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" json NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer, CONSTRAINT "FK_8af424a0959fa196e03d4fa7a48" FOREIGN KEY ("autherId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer, CONSTRAINT "FK_8af424a0959fa196e03d4fa7a48" FOREIGN KEY ("autherId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer, CONSTRAINT "FK_8af424a0959fa196e03d4fa7a48" FOREIGN KEY ("autherId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
    }

}
