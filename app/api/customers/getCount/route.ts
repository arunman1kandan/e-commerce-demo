import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {

    const count = await prisma.customer.count()

    return new Response(JSON.stringify(count))

}