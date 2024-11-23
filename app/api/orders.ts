import { prisma } from "@/lib/prisma"
export default async function handler(req, res) {
  if (req.method === "GET") {
    const orders = await prisma.order.findMany();
    return res.status(200).json(orders);
  }
  res.status(405).json({ message: "Method not allowed" });
}
