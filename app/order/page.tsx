"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Assuming this is a pre-designed button component

export default function OrderPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    productId: number;
    quantity: number;
  }[]>([]);
  const [email, setEmail] = useState(""); // Store customer email
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null); // To store customer info
  const [newCustomer, setNewCustomer] = useState<{ name: string; email: string }>({ name: "", email: "" }); // For new customer details
  const [isCustomerChecked, setIsCustomerChecked] = useState(false); // To track customer check status

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get("/api/inventory");
        if (data.items && Array.isArray(data.items)) {
          setInventory(data.items);
          setFilteredInventory(data.items); // Initialize filtered inventory
        } else {
          console.error("Inventory data is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = inventory.filter((item) =>
      item.product.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredInventory(filtered);
  };

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

  const handleCustomerCheck = async () => {
    if (!email) {
      toast.error("Please enter an email to check customer status.");
      return;
    }
  
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Checking email:", normalizedEmail);  // Debug line
      setCustomer(null);
  
      const customerResponse = await axios.get(`/api/customers?email=${normalizedEmail}`);
      console.log("API Response:", customerResponse);
  
      if (customerResponse.status === 200) {
        if (customerResponse.data?.customer) {
          setCustomer(customerResponse.data.customer);
          toast.success("You are already registered! Proceed to checkout.");
        } else {
          setCustomer(null);
          toast.error("Customer not found. Please register.");
        }
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      console.error("Error checking customer:", error);
      toast.error("There was an error checking your customer status. Please try again.");
    } finally {
      setIsCustomerChecked(true);
    }
  };

  const handleCustomerRegistration = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast.error("Please fill in all customer details.");
      return;
    }

    try {
      const customerResponse = await axios.post("/api/customers", newCustomer);
      if (customerResponse.status === 201) {
        setCustomer(customerResponse.data.customer);
        toast.success("Customer registered successfully!");
      } else {
        toast.error("Failed to register customer.");
      }
    } catch (error) {
      console.error("Error registering customer:", error);
      toast.error("Error registering customer.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error("Customer email is required");
        setLoading(false);
        return;
      }

      // Validate customer
      let customerEmail = email;
      if (!customer) {
        // If customer not found, we need to register them
        if (!newCustomer.name || !newCustomer.email) {
          toast.error("Please fill in customer details.");
          setLoading(false);
          return;
        }
        await handleCustomerRegistration();
        customerEmail = newCustomer.email; // Use new customer email
      } else {
        customerEmail = customer.email; // Use existing customer's email
      }

      const totalAmount = selectedItems.reduce((sum, item) => {
        const product = inventory.find((p) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);

      const orderPayload = {
        customerEmail, // Send customerEmail directly
        status: "pending",
        totalAmount,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await axios.post("/api/orders", orderPayload);

      if (orderResponse.status === 201) {
        // Update inventory quantities immediately after the order is created
        setInventory((prevInventory) =>
          prevInventory.map((item) => {
            const orderedItem = selectedItems.find(
              (selected) => selected.productId === item.id
            );
            if (orderedItem) {
              const updatedQuantity = item.quantity - orderedItem.quantity;
              return { ...item, quantity: updatedQuantity };
            }
            return item;
          })
        );

        toast.success("Order created successfully!");
        setEmail(""); // Reset customer email
        setSelectedItems([]); // Clear selected items
        handleSearch(""); // Reset filtered inventory
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
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Create New Order</h1>

      {inventoryLoading ? (
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span>Loading Inventory...</span>
        </div>
      ) : (
        <div>
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>

          {/* Inventory List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Items:</h2>
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium">{item.product}</p>
                  <p className="text-sm text-gray-500">
                    ${item.price} - In Stock: {item.quantity}
                  </p>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    max={item.quantity}
                    value={selectedItems.find(
                      (selected) => selected.productId === item.id
                    )?.quantity || 0}
                    onChange={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value))
                    }
                    className="border rounded-lg px-4 py-2 w-16"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Customer Email */}
          <div>
            <label className="block text-lg font-medium">Customer Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>

          {/* Customer Check button */}
          <Button
            type="button"
            onClick={handleCustomerCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4"
          >
            Check Customer
          </Button>

          {/* Customer Registration Form */}
          {!customer && isCustomerChecked && (
            <div className="mt-4 p-6 border rounded-lg bg-gray-100">
              <h3 className="text-lg font-medium mb-2">New Customer Registration</h3>
              <input
                type="text"
                placeholder="Name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full mb-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full mb-2"
              />
              <Button
                onClick={handleCustomerRegistration}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mt-4"
              >
                Register Customer
              </Button>
            </div>
          )}

          {/* Submit Order Button */}
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4"
            disabled={loading || selectedItems.length === 0}
          >
            {loading ? "Processing..." : "Submit Order"}
          </Button>
        </div>
      )}
    </div>
  );
}
