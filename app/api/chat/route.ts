import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // Get the current inventory items from the database
    const inventoryItems = await prisma.inventory.findMany();

    // Get the current orders from the database, including order items
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true, // Include related inventory (product)
          },
        },
        customer: true, // Include related customer data
      },
    });

    // Get the customers from the database
    const customers = await prisma.customer.findMany();

    // Format the inventory, orders, and customers data
    const inventoryContext = formatInventoryForPrompt(inventoryItems);
    const ordersContext = formatOrdersForPrompt(orders);
    const customersContext = formatCustomersForPrompt(customers);

    // Define the system prompt to give the model context on the task at hand
    const systemPrompt = `
    You are an assistant named ChatCart that helps answer questions about an e-commerce system.
    The system has the following inventory, orders, and customers data:

    **Inventory:**
    ${inventoryContext}
    
    **Orders:**
    ${ordersContext}

    **Customers:**
    ${customersContext}
    
    Note that you have to differentiate customers based on thier email addresses and not thier names even if 2 or more people have same name and different emails they are different
    Note: Since the ordersContext has Items which is an array of objects, you should format it so that it is easy to read and understand.
    Never ever give HTML format in your response. Always use markdown format.
    Please answer the user's questions based on the current state of inventory, orders, and customers.
    Use markdown syntax to make your response clear, professional, and well-formatted. Include borders for tables where applicable.
    `;

    // Combine the inventory, orders, and customers context with the user prompt
    const fullPrompt = `${systemPrompt}\n\nUser's question: ${prompt}`;

    // Get response from Groq based on the full prompt
    const response = await getGroqChatCompletion(fullPrompt);
    const message = response.choices[0]?.message?.content || "No response";

    return NextResponse.json({ response: message }, { status: 200 });
  } catch (error) {
    console.error("Error in API handler:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

async function getGroqChatCompletion(prompt: string) {
  return groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192", // Adjust the model as needed
  });
}

// Helper function to format the inventory data for the prompt
function formatInventoryForPrompt(inventoryItems: Array<{ product: string; quantity: number; price: number }>) {
  return inventoryItems.map((item) => {
    return `Product: ${item.product}, Quantity: ${item.quantity}, Price: ${item.price}`;
  }).join("\n");
}

// Helper function to format the orders data for the prompt
function formatOrdersForPrompt(orders: Array<{ id: number; customer: { name: string }; status: string; createdAt: Date; items: Array<{ product: { product: string }; quantity: number; price: number; tax: number; discount: number }> }>) {
  return orders.map((order) => {
    const items = order.items.map(item => {
      return `Product: ${item.product.product}, Quantity: ${item.quantity}, Price: ${item.price}, Tax: ${item.tax ?? 'N/A'}, Discount: ${item.discount ?? 'N/A'}`;
    }).join("\n");

    return `Order ID: ${order.id}, Customer: ${order.customer.name}, Status: ${order.status}, Created At: ${order.createdAt}, Items:\n${items}`;
  }).join("\n");
}

// Helper function to format the customers data for the prompt
function formatCustomersForPrompt(customers: Array<{ id: number; name: string; email: string; createdAt: Date }>) {
  return customers.map((customer) => {
    return `Customer ID: ${customer.id}, Name: ${customer.name}, Email: ${customer.email}, Joined At: ${customer.createdAt.toISOString()}`;
  }).join("\n");
}
