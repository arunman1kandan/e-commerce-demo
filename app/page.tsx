"use client"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Users, DollarSign, Activity, Loader2, HomeIcon, PackageCheckIcon, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { useEffect, useState } from 'react'  // Import necessary hooks from React

// Fetch customer count from API
async function getCustomerCount() {
  const res = await axios.get('http://localhost:3000/api/customers/getCount')
  return res.data
}

// Fetch orders count from API
async function getOrdersCount(){
  const res = await axios.get('http://localhost:3000/api/orders/getCount')
  return res.data
}

// Fetch products count from API
async function getProductsCount(){
  const res = await axios.get('http://localhost:3000/api/inventory/getCount')
  return res.data
}

// Fetch revenue from API
async function getRevenue(){
  const res = await axios.get('http://localhost:3000/api/orders/getRevenue')
  return res.data
}

export default function Page() {
  // Define state variables to hold the fetched data
  const [customerCount, setCustomerCount] = useState(null)
  const [ordersCount, setOrdersCount] = useState(null)
  const [productsCount, setProductsCount] = useState(null)
  const [revenue, setRevenue] = useState(null)

  // Fetch data once when the component mounts
  useEffect(() => {
    async function fetchData() {
      const customerData = await getCustomerCount()
      const orderData = await getOrdersCount()
      const productData = await getProductsCount()
      const revenueData = await getRevenue()
      
      // Update the state with the fetched data
      setCustomerCount(customerData)
      setOrdersCount(orderData)
      setProductsCount(productData)
      setRevenue(revenueData)
    }
    
    fetchData()  // Call the async function to fetch data
  }, [])  // Empty dependency array ensures the effect runs only once (on mount)

  // Check if the data is still being loaded (optional: can show a loading state)
  if (customerCount === null || ordersCount === null || productsCount === null || revenue === null) {
    return <div className='h-screen flex flex-col gap-2 items-center justify-center'>
      <Loader2 className='animate-spin' size={40} />
      <h2>
      Please wait while we fetch the data...
      </h2>
    </div>
  }

  const navbarItems = [
    {
      title: 'Home',
      href: '/',
      icon: <HomeIcon size={20} />
    },
    {
      title: 'Products',
      href: '/products',
      icon: <Package size={20} />
    },
    {
      title: 'Add to inventory',
      href: '/inventory',
      icon: <ShoppingCart size={20} />
    },
    {
      title: 'Place an order',
      href: '/order',
      icon: <PackageCheckIcon size={20} />
    },
    {
      title : "Chat with our AI",
      href : "/chat",
      icon : <MessageCircle size={20}/>
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">E-commerce Admin</h1>
            <nav>
              <ul className="flex space-x-4">
                  {navbarItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        {item.icon}
                        {item.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, Admin</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productsCount}</div>
                <p className="text-xs text-muted-foreground">+10% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ordersCount}</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerCount}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenue}</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  <span>New order #1234 received from John Doe</span>
                </li>
                <li className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  <span>Product "Wireless Headphones" stock updated</span>
                </li>
                <li className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>Customer support ticket #5678 resolved</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 E-commerce Admin Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
