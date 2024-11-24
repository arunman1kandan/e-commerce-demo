import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle GET requests to fetch all orders
export async function GET(req: Request) {
  try {
    // Query all orders, including related customer and order items
    const orders = await prisma.order.findMany({
      include: {
        customer: true, // Include customer details
        items: {
          include: {
            product: true, // Include product details for each order item
          },
        },
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 });
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

// Handle POST requests to create a new order
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { customerId, customerEmail, status, items } = await req.json();

    // Log the received data to verify it
    console.log("Received data:", { customerId, customerEmail, status, items });

    // Validate input fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    // Set customerId to the received one or try to find the customer if it's missing
    let finalCustomerId = customerId;

    // If no customerId is provided, try to find the customer using the email
    if (!finalCustomerId && customerEmail) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: customerEmail },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id; // Use the existing customer's ID
      } else {
        // If no customer exists with that email, create a new customer
        const newCustomer = await prisma.customer.create({
          data: {
            email: customerEmail,
            name: customerEmail.split('@')[0], // Use email prefix as customer name (optional customization)
          },
        });
        finalCustomerId = newCustomer.id; // Use the new customer's ID
      }
    }

    // Log the final customer ID that will be used for the order
    console.log("Final customer ID:", finalCustomerId);

    // Begin Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          customerId: finalCustomerId,
          status,
        },
      });

      console.log("Created neworder:", newOrder)


      // Loop through the order items to create the order items and update inventory
      console.log("Items:", items)

      for (const item of items) {

        const { productId, quantity, price, tax, discount } = item;

        // Find the product in the inventory
        const inventoryItem = await prisma.inventory.findUnique({
          where: { id: productId },
        });

        console.log("Inventory item:", inventoryItem)
        const finalPrice = inventoryItem!.price

        // Check if the product is in stock
        if (!inventoryItem || inventoryItem.quantity < quantity) {
          throw new Error(`Not enough stock for product ID ${productId}`);
        }

        console.log("Data : ", { productId, quantity, price, tax, discount })

        // Create the order item
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId,
            quantity,
            price : finalPrice,
            tax: tax || 0,
            discount: discount || 0,
          },
        });

        console.log("Created order item:")

        // Update the inventory after the order is placed
        await prisma.inventory.update({
          where: { id: productId },
          data: {
            quantity: {
              decrement: quantity, // Decrease the stock by the quantity sold
            },
            totalValue: (inventoryItem.quantity - quantity) * inventoryItem.price, // Update total value of inventory
          },
        });
      }

      return newOrder; // Return the created order
    });

    // Return a success response with the created order
    return NextResponse.json({ order: result }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error); // Log the error
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
