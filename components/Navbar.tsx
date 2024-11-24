"use client"

import { HomeIcon, MessageCircle, Package, PackageCheckIcon, ShoppingCart } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from 'next/link'


export default function Navbar() {
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

      const pathName = usePathname()

  return (
    <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">E-commerce Admin</h1>
            <nav>
              <ul className="flex space-x-4">
                  {navbarItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className={`text-gray-600 hover:text-gray-900 flex items-center gap-1 pb-2
                      ${pathName === item.href ? "text-blue-500" : "text-gray-600"}
                      `}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
  )
}
