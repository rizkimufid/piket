-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_orgId_idx" ON "Room"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_orgId_name_key" ON "Room"("orgId", "name");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: kamar string lama → Room (per org), lalu tautkan Membership.
INSERT INTO "Room" (id, "orgId", name)
SELECT md5("orgId" || '|' || "kamar")::uuid::text, "orgId", "kamar"
FROM "Membership"
WHERE "kamar" IS NOT NULL AND "kamar" <> ''
GROUP BY "orgId", "kamar";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN "roomId" TEXT;

UPDATE "Membership" m
SET "roomId" = r.id
FROM "Room" r
WHERE r."orgId" = m."orgId" AND r.name = m."kamar";

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "kamar";