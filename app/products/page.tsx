"use client"
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectItem , SelectContent } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { Search, ChevronDown, Loader2, ArrowLeft } from 'lucide-react'

const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/inventory')
    return response.data.items  // Accessing 'items' from the response
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loading, setLoading] = useState(true)

  // Fetch products once when the page loads
  useEffect(() => {
    const getProducts = async () => {
      const productData = await fetchProducts()
      setProducts(productData)
      setFilteredProducts(productData) // Initially, all products are shown
      setLoading(false)
    }

    getProducts()
  }, [])

  // Handle search locally
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    const filtered = products.filter(product =>
      product.product.toLowerCase().includes(query.toLowerCase()) // Searching by product name
    )
    setFilteredProducts(filtered)
  }

  // Handle sort locally
  const handleSortChange = (value) => {
    setSortBy(value)

    const sortedProducts = [...filteredProducts]
    if (value === 'name') {
      sortedProducts.sort((a, b) => a.product.localeCompare(b.product))
    } else if (value === 'price') {
      sortedProducts.sort((a, b) => a.price - b.price)
    }
    setFilteredProducts(sortedProducts)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-2 items-center">
          <Button size={"sm"} onClick={() => window.location.href = "/"}>
          <ArrowLeft/>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex mb-6">
            <Input
              type="text"
              placeholder="Search Products"
              className="w-1/3 mr-4"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Select onValueChange={handleSortChange} defaultValue="name">
              <SelectTrigger>
                <SelectValue>{sortBy === 'name' ? 'Sort by Name' : 'Sort by Price'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price">Sort by Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className='h-screen flex flex-col items-center justify-center'>
              <Loader2 className='animate-spin' /> Fetching products form inventory
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{product.product}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">Price: ${product.price}</div>
                    <div className="mt-2 text-sm">Stock: {product.quantity}</div>
                    <div className="mt-2 text-sm text-gray-500">Total Value: ${product.totalValue}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className= " absolute w-full bottom-0 bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 E-commerce Admin Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
