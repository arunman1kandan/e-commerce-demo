import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you are using Prisma for DB interaction

export async function GET(req: Request) {
  try {
    // Query all orders from the database without any filters
    const orders = await prisma.order.findMany({
    });

    // If no orders found
    if (orders.length === 0) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 });
    }

    // Return the fetched orders
    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    console.error("Error fetching orders:", error);

    // Provide more detailed error message based on the error type
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For unknown errors, return a generic message
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    // Parse the request body
    const { customer, status, totalAmount, items } = await req.json();

    // Validate the input
    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Create a transaction to ensure atomicity (either everything succeeds or everything fails)
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the order
      const newOrder = await prisma.order.create({
        data: {
          customer,
          status,
          totalAmount,
          items: JSON.stringify(items), // Store items as JSON
        },
      });

      // Step 2: Update inventory - Decrease stock for each item in the order
      for (const item of items) {
        const inventoryItem = await prisma.inventory.findUnique({
          where: { id: item.productId },
        });

        // Check if the item exists and has enough stock
        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new Error(`Not enough stock for product ID ${item.productId}`);
        }

        // Decrease the inventory quantity
        await prisma.inventory.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            totalValue: (inventoryItem.quantity - item.quantity) * inventoryItem.price, // Update total value
          },
        });
      }

      // Return the new order if everything was successful
      return newOrder;
    });

    // Return a success response
    return NextResponse.json({ order: result }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
