import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {

    const ordersCount = await prisma.order.count()

    return new Response(JSON.stringify(ordersCount))


}