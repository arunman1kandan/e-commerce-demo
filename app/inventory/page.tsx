"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner"; // Import toast from Sonner
import { Button } from "@/components/ui/button";

export default function AddInventoryForm() {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/inventory", {
        product,
        quantity: Number(quantity),
        price: Number(price),
      });

      // Success toast
      toast.success("Inventory item added successfully!", {
        description: `Product: ${product}, Quantity: ${quantity}, Price: $${price}`,
      });

      setProduct("");
      setQuantity("");
      setPrice("");
    } catch (error) {
      console.error("Error adding inventory item:", error);

      // Error toast
      toast.error("Failed to add item to inventory", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Add Inventory
        </h2>
        <p className="text-center text-gray-500">
          Fill in the details to add a new product to your inventory.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Product Name
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
            placeholder="Enter product name"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter quantity"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-80"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Price (in $)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Enter price"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 "
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full  font-medium py-2 rounded-lg shadow-md transition duration-300"
        >
          {loading ? "Adding..." : "Add to Inventory"}
        </Button>
      </form>
    </div>
  );
}
