import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDatabase1745407461405 implements MigrationInterface {
    name = 'AddedDatabase1745407461405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer)`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer)`);
        await queryRunner.query(`CREATE TABLE "post_likes" ("postId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6999d13aca25e33515210abaf1" ON "post_likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_37d337ad54b1aa6b9a44415a49" ON "post_likes" ("userId") `);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer, CONSTRAINT "FK_8af424a0959fa196e03d4fa7a48" FOREIGN KEY ("autherId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_6999d13aca25e33515210abaf1"`);
        await queryRunner.query(`DROP INDEX "IDX_37d337ad54b1aa6b9a44415a49"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_likes" ("postId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`INSERT INTO "temporary_post_likes"("postId", "userId") SELECT "postId", "userId" FROM "post_likes"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_likes" RENAME TO "post_likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_6999d13aca25e33515210abaf1" ON "post_likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_37d337ad54b1aa6b9a44415a49" ON "post_likes" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_37d337ad54b1aa6b9a44415a49"`);
        await queryRunner.query(`DROP INDEX "IDX_6999d13aca25e33515210abaf1"`);
        await queryRunner.query(`ALTER TABLE "post_likes" RENAME TO "temporary_post_likes"`);
        await queryRunner.query(`CREATE TABLE "post_likes" ("postId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`INSERT INTO "post_likes"("postId", "userId") SELECT "postId", "userId" FROM "temporary_post_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_post_likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_37d337ad54b1aa6b9a44415a49" ON "post_likes" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6999d13aca25e33515210abaf1" ON "post_likes" ("postId") `);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "content" text NOT NULL, "hashTags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "autherId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId") SELECT "id", "title", "content", "hashTags", "createdAt", "updatedAt", "autherId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer)`);
        await queryRunner.query(`INSERT INTO "follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`DROP INDEX "IDX_37d337ad54b1aa6b9a44415a49"`);
        await queryRunner.query(`DROP INDEX "IDX_6999d13aca25e33515210abaf1"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
