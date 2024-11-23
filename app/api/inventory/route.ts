import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// Handle GET requests to fetch inventory items
export async function GET() {
  try {
    const items = await prisma.inventory.findMany();
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 });
  }
}

// Handle POST requests to add a new inventory item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, quantity, price } = body;

    const totalValue = quantity * price;
    
    // Validate input
    if (!product || quantity == null || price == null) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const newItem = await prisma.inventory.create({
      data: { product, quantity, price, totalValue },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return NextResponse.json({ error: "Failed to add inventory item" }, { status: 500 });
  }
}

// Handle PUT requests to update inventory after an order is placed
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { inventoryUpdates } = body; // Expected to be an array of { productId, quantity }

    if (!inventoryUpdates || !Array.isArray(inventoryUpdates)) {
      return NextResponse.json({ error: "Invalid inventory updates data" }, { status: 400 });
    }

    const updatedInventoryPromises = inventoryUpdates.map(async (update: { productId: number; quantity: number }) => {
      const { productId, quantity } = update;

      // Find the current inventory item
      const product = await prisma.inventory.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Ensure the inventory quantity doesn't go negative
      if (product.quantity < quantity) {
        throw new Error(`Not enough stock for ${product.product}`);
      }

      // Update the inventory item
      return prisma.inventory.update({
        where: { id: productId },
        data: {
          quantity: product.quantity - quantity, // Decrease the quantity
          totalValue: (product.quantity - quantity) * product.price, // Update total value
        },
      });
    });

    const updatedInventory = await Promise.all(updatedInventoryPromises);

    return NextResponse.json({ inventory: updatedInventory }, { status: 200 });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: error || "Failed to update inventory" }, { status: 500 });
  }
}
