import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma"; // Assuming you are using Prisma for DB interaction

const groq = new Groq({ apiKey: process.env.GROQ_API });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    
    // Get the current inventory items from the database
    const inventoryItems = await prisma.inventory.findMany();

    // Get the current orders from the database
    const orders = await prisma.order.findMany();

    // Format the inventory and orders data
    const inventoryContext = formatInventoryForPrompt(inventoryItems);
    const ordersContext = formatOrdersForPrompt(orders);

        // Define the system prompt to give the model context on the task at hand
        const systemPrompt = `
        You are an assistant that helps answer questions about an e-commerce system.
        The system has the following inventory and orders data:
        Inventory:
        ${inventoryContext}
        
        Orders:
        ${ordersContext}

        Note since the ordersContext has Items which is an array of objects, you should format it so that it is easy to read and understand.
        
        Please answer the user's questions based on the current state of inventory and orders.
        You can use markdown syntax for formatting your response and make sure that the response is clear and concise and not cluttered and give borders for tables.
      `;
  

    // Combine the inventory and orders context with the user prompt
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
function formatOrdersForPrompt(orders: Array<{ id: number; customer: string; status: string; totalAmount: number; items: any; createdAt: Date }>) {
  return orders.map((order) => {
    const items = JSON.stringify(order.items); // Serialize the JSON to a string
    return `Order ID: ${order.id}, Customer: ${order.customer}, Status: ${order.status}, Total Amount: ${order.totalAmount}, Created At: ${order.createdAt}, Items: ${items}`;
  }).join("\n");
}
