import { prisma } from "@/lib/prisma";

// GET method to fetch customer by email
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  console.log("Received email:", email)


  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400 }
    );
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    console.log("Fetched customer:", customer)



    if (!customer) {
      return new Response(
        JSON.stringify({ message: "Customer not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ customer }), { status: 200 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch customer" }),
      { status: 500 }
    );
  }
}

// POST method to create a new customer
export async function POST(req: Request) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return new Response(
      JSON.stringify({ error: "Name and email are required" }),
      { status: 400 }
    );
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return new Response(
        JSON.stringify({ message: "Customer already exists" }),
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: { name, email },
    });

    return new Response(JSON.stringify({ customer }), { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create customer" }),
      { status: 500 }
    );
  }
}
