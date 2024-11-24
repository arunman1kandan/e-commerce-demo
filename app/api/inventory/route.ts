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
    let { product, quantity, price } = body;

    let totalValue = quantity * price;

    // Validate input
    if (!product || quantity == null || price == null) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const currentInventory = await prisma.inventory.findMany();
    console.log(currentInventory)

    let pid : number | undefined = undefined;

    currentInventory.forEach(item => {
      if(item.product === product){
        //Item already exists in the database so get the current quantity and add the new quantity to it
        pid = item.id
        quantity += item.quantity
        totalValue = quantity * price
      }
    })

    if(pid !== undefined){
      const updatedItem = await prisma.inventory.update({
        where : {id : pid},
        data : {
          quantity,
          price,
          totalValue,
          product,
        }
      })
      return NextResponse.json({ item: updatedItem }, { status: 201 });
    }

    else{
    const newItem = await prisma.inventory.create({
      data: { product, quantity, price, totalValue },
    });
    return NextResponse.json({ item: newItem }, { status: 201 });
  }

  } catch (error) {
    console.error("Error adding inventory item:", error);
    return NextResponse.json({ error: "Failed to add inventory item" }, { status: 500 });
  }
}

// Handle PUT requests to update inventory after an order is placed
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId, inventoryUpdates } = body; // Expected to be { orderId, inventoryUpdates: [{ productId, quantity, price }] }

    if (!orderId || !inventoryUpdates || !Array.isArray(inventoryUpdates)) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Transaction to handle updates and order item creation
    const updatedInventory = await prisma.$transaction(async (prisma) => {
      return Promise.all(
        inventoryUpdates.map(async (update: { productId: number; quantity: number; price: number }) => {
          const { productId, quantity, price } = update;

          // Fetch the current inventory item
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
          const updatedProduct = await prisma.inventory.update({
            where: { id: productId },
            data: {
              quantity: product.quantity - quantity, // Decrease quantity
              totalValue: (product.quantity - quantity) * product.price, // Update total value
            },
          });

          // Calculate optional tax and discount (set to 0 if not used)
          const tax = 0; // Replace with your custom tax logic if needed
          const discount = 0; // Replace with your custom discount logic if needed

          // Create a corresponding OrderItem
          await prisma.orderItem.create({
            data: {
              orderId, // Link to the order
              productId, // Link to the inventory item
              quantity,
              price, // Record the price at the time of the order
              tax,
              discount,
            },
          });

          return updatedProduct;
        })
      );
    });

    return NextResponse.json({ inventory: updatedInventory }, { status: 200 });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: error.message || "Failed to update inventory" }, { status: 500 });
  }
}
