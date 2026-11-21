/*
  Warnings:

  - You are about to drop the column `draftDefination` on the `agent` table. All the data in the column will be lost.
  - Added the required column `draftDefinition` to the `agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent" DROP COLUMN "draftDefination",
ADD COLUMN     "draftDefinition" JSONB NOT NULL;
