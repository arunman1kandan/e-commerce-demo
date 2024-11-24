"use client"

import { prisma } from '@/lib/prisma';
import React, { useState, useEffect } from 'react';
import { JsonValue } from 'type-fest'; // Importing JsonValue if necessary

// Define the Order type
interface Order {
  status: string;
  id: number;
  customer: string;
  totalAmount: number;
  items: JsonValue; // Use JsonValue for items
  createdAt: Date;
}

async function fetchOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany();
  console.log(orders)
  return orders;
}

function Page() {
  const [orders, setOrders] = useState<Order[]>([]); // Using the Order type here
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getOrders() {
      try {
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
    getOrders();
  }, []);

  console.log(orders)

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className='border border-gray-300 p-4 rounded-md'>
            <div className="flex flex-col gap-1">
              <p className='text-gray-500'>Order Number: {order.id}</p>
              <p className='text-gray-500'>Customer Name: {order.customer}</p>
            </div>
            <p className='text-gray-500'>Order placed At: {new Date(order.createdAt).toString()}</p>
            <p className='text-gray-500'>Current status: {order.status}</p>
            <p className='text-gray-500'>Total amount: {order.totalAmount}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Page;
