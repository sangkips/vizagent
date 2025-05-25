"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    }

    // Listen for authChange event
    const handleAuthChange = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        setIsAuthenticated(!!token);
      }
    };

    window.addEventListener("authChange", handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("access_token")) {
      e.preventDefault();
      router.push("/login?redirect=/documents");
    } else {
      router.push("/documents");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      window.dispatchEvent(new Event("authChange")); // Notify other components
      router.push("/login");
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">
          <Link href="/">VizAgent</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className={pathname === "/" ? "underline" : ""}>
            Home
          </Link>
          {/* <Link href="/about" className={pathname === "/about" ? "underline" : ""}>
            About Us
          </Link> */}
          <button
            onClick={handleDashboardClick}
            className={pathname.startsWith("/documents") ? "underline" : ""}
          >
            Dashboard
          </button>
          {isAuthenticated && (
            <Link href='/login' onClick={handleLogout} className="text-white border-white">
              Logout
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}