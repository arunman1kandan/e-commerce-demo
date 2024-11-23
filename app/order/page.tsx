"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Customize this button as per your need

export default function OrderPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number }[]>([]);
  const [customer, setCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true); // State to track inventory loading

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get("/api/inventory");
        console.log("Fetched Inventory:", data); // Log the entire response
        if (data.items && Array.isArray(data.items)) {
          setInventory(data.items); // Access items array here
        } else {
          console.error("Inventory data is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setInventoryLoading(false); // Stop the loader once inventory is fetched
      }
    };

    fetchInventory();
  }, []);

  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);

      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total value of the order
      const totalAmount = selectedItems.reduce((sum, item) => {
        const product = inventory.find((p) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);

      // Prepare the order payload
      const orderPayload = {
        customer,
        status: "pending", // You can modify this based on order status
        totalAmount,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      // Send order data to the server
      const orderResponse = await axios.post("/api/orders", orderPayload);

      // If order was successful, update the inventory
      if (orderResponse.status === 201) {
        // Update inventory after order is confirmed
        setInventory((prevInventory) =>
          prevInventory.map((item) => {
            const orderedItem = selectedItems.find((selected) => selected.productId === item.id);
            if (orderedItem) {
              const updatedQuantity = item.quantity - orderedItem.quantity;
              return { ...item, quantity: updatedQuantity };
            }
            return item;
          })
        );
        
        toast.success("Order created successfully!");
        setCustomer(""); // Reset customer name
        setSelectedItems([]); // Reset selected items
      } else {
        toast.error("Failed to create the order.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create the order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center">Create New Order</h2>

      {/* Loader while fetching inventory */}
      {inventoryLoading ? (
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span>Loading Inventory...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Customer Name:</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block">Select Items:</label>
            {inventory.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={
                    selectedItems.find((selected) => selected.productId === item.id)?.quantity || ""
                  }
                  onChange={(e) =>
                    handleQuantityChange(item.id, Number(e.target.value))
                  }
                  className="border rounded-lg px-2 py-1"
                />
                <span>{item.product} - ${item.price} - In Stock: {item.quantity}</span>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !customer || selectedItems.length === 0}
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            {loading ? "Creating Order..." : "Create Order"}
          </Button>
        </form>
      )}
    </div>
  );
}
