/*
  Warnings:

  - You are about to drop the `_CategoriesToProducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoriesId` on the `category_products` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `category_products` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `category_products` table. All the data in the column will be lost.
  - You are about to drop the column `productsId` on the `category_products` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `category_products` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `category_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `category_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_CategoriesToProducts_B_index";

-- DropIndex
DROP INDEX "_CategoriesToProducts_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CategoriesToProducts";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_category_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    CONSTRAINT "category_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_category_products" ("id") SELECT "id" FROM "category_products";
DROP TABLE "category_products";
ALTER TABLE "new_category_products" RENAME TO "category_products";
CREATE UNIQUE INDEX "category_products_product_id_category_id_key" ON "category_products"("product_id", "category_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
