-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "fomapan400hc110" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "fomapan400hc110_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fomapan400ilfosol3" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "fomapan400ilfosol3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fomapan400ilfoteclc29" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "fomapan400ilfoteclc29_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fomapan400rodinal" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "fomapan400rodinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fomapan400tmaxdev" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" VARCHAR(10),
    "temp" VARCHAR(10),

    CONSTRAINT "fomapan400tmaxdev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hp5hc110" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "hp5hc110_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hp5ilfosol3" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "hp5ilfosol3_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hp5ilfoteclc29" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "hp5ilfoteclc29_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hp5rodinal" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "hp5rodinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hp5tmaxdev" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "hp5tmaxdev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmax400hc110" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" VARCHAR(10),
    "temp" VARCHAR(10),

    CONSTRAINT "tmax400hc110_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmax400ilfosol3" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "tmax400ilfosol3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmax400rodinal" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "tmax400rodinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmax400tmaxdev" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "tmaxtmaxdev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" DEFAULT 'USER',
    "username" VARCHAR(100) NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpx400hc110" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "rpx400hc110_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpx400ilfosol3" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "rpx400ilfosol3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpx400ilfoteclc29" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "rpx400ilfoteclc29_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpx400tmaxdev" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "rpx400tmaxdev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmax400ilfoteclc29" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(50),
    "developer" VARCHAR(50),
    "dilution" VARCHAR(10),
    "asa_iso" INTEGER,
    "time_35mm" DECIMAL(5,2),
    "temp" VARCHAR(10),

    CONSTRAINT "tmaxilfoteclc29_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trix400hc110" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" VARCHAR(20) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "trix400hc110_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trix400ilfosol3" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "trix400ilfosol3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trix400ilfoteclc29" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" VARCHAR(20) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "trix400ilfoteclc29_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trix400rodinal" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" DECIMAL(5,2) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "trix400rodinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trix400tmaxdev" (
    "id" SERIAL NOT NULL,
    "film" VARCHAR(100) NOT NULL,
    "developer" VARCHAR(50) NOT NULL,
    "dilution" VARCHAR(10) NOT NULL,
    "asa_iso" INTEGER NOT NULL,
    "time_35mm" VARCHAR(20) NOT NULL,
    "temperature" VARCHAR(10) NOT NULL,

    CONSTRAINT "trix400tmaxdev_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_photoId_key" ON "Like"("userId", "photoId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
