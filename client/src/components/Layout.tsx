import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="font-semibold">
            is it cinema?
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}