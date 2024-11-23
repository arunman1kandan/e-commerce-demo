-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "customer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
