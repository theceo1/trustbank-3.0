// components/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { ThemeToggle } from "./theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from '@/app/admin/context/AdminAuthContext';
import { Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">
              trustBank
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6 ml-auto">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/market" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Market
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/calculator" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Calculator
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  About
                </Link>
              </NavigationMenuItem>
              {user && (
                <>
                  <NavigationMenuItem>
                    <Link href="/trade" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      Trade
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/dashboard" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
              {isAdmin && (
                <NavigationMenuItem>
                  <Link href="/admin" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Admin
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isOpen && (
          <div ref={menuRef} className="absolute top-full left-0 right-0 bg-background border-b md:hidden">
            <div className="container py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/market" className="text-sm font-medium">Market</Link>
                <Link href="/calculator" className="text-sm font-medium">Calculator</Link>
                <Link href="/about" className="text-sm font-medium">About</Link>
                {user && (
                  <>
                    <Link href="/trade" className="text-sm font-medium">Trade</Link>
                    <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
                  </>
                )}
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium">Admin</Link>
                )}
                {!loading && (
                  <>
                    {user ? (
                      <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/auth/register">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
