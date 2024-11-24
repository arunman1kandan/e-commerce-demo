import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {

    const iventoryCount = await prisma.inventory.count();

    return new Response(JSON.stringify(iventoryCount))

}