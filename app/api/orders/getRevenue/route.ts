import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {

    //fetch every itmes from order and sum up the total price

    const revenue = await prisma.orderItem.findMany()
    let totalPrice = 0

    for (const item of revenue) {

        totalPrice += item.price

    }

    return new Response(JSON.stringify(totalPrice))

}