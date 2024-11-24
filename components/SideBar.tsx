import { BoxIcon, ClipboardIcon, HomeIcon, MessageCircle } from "lucide-react";
import Link from "next/link";

const links = [
    {name : "Home", href : "/", icon : <HomeIcon />},
    { name: "Chat", href: "/chat", icon: <MessageCircle /> },
    { name: "Orders", href: "/list/orders", icon: <ClipboardIcon /> },
    { name: "Place Order", href: "/order", icon: <HomeIcon /> },
    { name: "Inventory", href: "/inventory", icon: <BoxIcon /> },
];

const Sidebar = () => {
    return (
        <aside className="h-screen w-64 bg-gray-900 text-white p-4">
            <div className="mb-8 text-xl font-bold">Dashboard</div>
            <nav className="flex flex-col space-y-4">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center space-x-4 px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
