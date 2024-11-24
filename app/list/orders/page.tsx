"use client";

import { useEffect, useState } from "react";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table"; // Import Shadcn table components
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Import Shadcn card components
import { Loader2 } from "lucide-react";

interface Order {
  id: number;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  items: {
    product: {
      product: string;
    };
    quantity: number;
    price: number;
  }[];  
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch orders from the API
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">Orders</h2>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-auto">
            <TableHead>
              <TableRow>
                <TableCell className="text-left px-4 py-2">Order ID</TableCell>
                <TableCell className="text-left px-4 py-2">Customer</TableCell>
                <TableCell className="text-center px-4 py-2">Status</TableCell>
                <TableCell className="text-left px-4 py-2">Items</TableCell>
                <TableCell className="text-center px-4 py-2">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-left px-4 py-2">{order.id}</TableCell>
                  <TableCell className="text-left px-4 py-2">
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-left px-4 py-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <p>{item.product.product}</p>
                        <p className="text-gray-500">
                          Quantity: {item.quantity}, Price: ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-center px-4 py-2">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
