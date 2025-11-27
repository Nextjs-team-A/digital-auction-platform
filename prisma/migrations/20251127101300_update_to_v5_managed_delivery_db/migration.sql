/*
  Warnings:

  - You are about to drop the column `isPaid` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'REQUESTED', 'PICKED_UP', 'DELIVERED_PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deliveryFee" DOUBLE PRECISION,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "finalBidAmount" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "platformCommission" DOUBLE PRECISION,
ADD COLUMN     "sellerPayout" DOUBLE PRECISION,
ADD COLUMN     "totalCollected" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPaid";
