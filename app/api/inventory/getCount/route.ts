import { prisma } from "@/lib/prisma";

//GET METHOD TO RETURN COUNT OF INVENTORY ITEMS
export async function GET(req: Request) {

    const iventoryCount = await prisma.inventory.count();

    return new Response(JSON.stringify(iventoryCount))

}