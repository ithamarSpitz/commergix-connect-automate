
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Box,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    icon: Store,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Users,
    adminOnly: true,
  },
];

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems
        .filter((item) => !item.adminOnly || (item.adminOnly && isAdmin))
        .map((item) => (
          <Button
            key={item.href}
            variant={location.pathname.startsWith(item.href) ? "default" : "ghost"}
            size="sm"
            className="justify-start"
            asChild
          >
            <Link 
              to={item.href}
              className="flex items-center"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
    </nav>
  );
}