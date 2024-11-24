"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Users, DollarSign, Activity, Loader2, HomeIcon, PackageCheckIcon, MessageCircle, ActivityIcon } from 'lucide-react'
import axios from 'axios'
import { useEffect, useState } from 'react'  // Import necessary hooks from React
import { usePathname } from 'next/navigation'

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

async function getRecentActivittties(){
  const prompt = `you are supposed to send a one line response with no content added by you.
  You are a data analyst for an e-commerce website and provide insights based on the data.
  You have to analyze the recent activities of the website and return the most important activity in one line.
  All the money are in rupees only even in DB so dont convert them
  And never mention about money just recent trends and things about inventory

  like above but one liner
  `

  const recentActivities = []
  //send th prompt to the llm
  for(let i=0; i<4; i++){
    const res = await axios.post('http://localhost:3000/api/chat', {prompt})
    recentActivities.push(res.data.response)
  }
  return recentActivities
}

export default function Page() {
  const pathName = usePathname()
  console.log(pathName)

  // Define state variables to hold the fetched data
  const [customerCount, setCustomerCount] = useState(null)
  const [ordersCount, setOrdersCount] = useState(null)
  const [productsCount, setProductsCount] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])


  // Fetch data once when the component mounts
  useEffect(() => {
    async function fetchData() {
      const customerData = await getCustomerCount()
      const orderData = await getOrdersCount()
      const productData = await getProductsCount()
      const revenueData = await getRevenue()
      const recentActivitiesData = await getRecentActivittties()
      console.log(recentActivitiesData)
      
      // Update the state with the fetched data
      setCustomerCount(customerData)
      setOrdersCount(orderData)
      setProductsCount(productData)
      setRecentActivities(recentActivitiesData)
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


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      

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
                  {recentActivities.map((activity, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <ActivityIcon />
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity}</p>
                        </div>
                      </li>
                  ))}
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
