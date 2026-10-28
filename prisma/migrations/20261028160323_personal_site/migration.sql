-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "statusEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "statusTr" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "titleTr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "items" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "titleTr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyTrJson" JSONB,
    "bodyTrHtml" TEXT NOT NULL DEFAULT '',
    "bodyEnJson" JSONB,
    "bodyEnHtml" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);
