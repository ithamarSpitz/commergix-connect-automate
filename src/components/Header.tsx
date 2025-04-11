import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell } from "lucide-react";
import { UsageBadge } from "@/components/UsageBadge";
import { Package } from "lucide-react";

export function Header() {
  const { user, userDetails, signOut } = useAuth();
  const [initials, setInitials] = useState("CX");

  useEffect(() => {
    if (userDetails?.name) {
      // Get initials from name
      const nameParts = userDetails.name.split(" ");
      if (nameParts.length >= 2) {
        setInitials(`${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`);
      } else if (nameParts.length === 1) {
        setInitials(nameParts[0].substring(0, 2));
      }
    } else if (user?.email) {
      // Get initials from email
      setInitials(user.email.substring(0, 2).toUpperCase());
    }
  }, [user, userDetails]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span className="font-bold text-xl hidden md:inline-block">Commergix</span>
          </Link>
          <MainNav className="mx-6 hidden md:flex" />
        </div>
        
        <div className="flex items-center gap-4">
          {user && <UsageBadge />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 px-4 text-sm text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userDetails?.avatarUrl || ''} alt={userDetails?.name || 'User'} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userDetails?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
