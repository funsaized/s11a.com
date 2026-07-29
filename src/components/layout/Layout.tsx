import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import "../../styles/globals.css";
import "../../styles/prism-theme.css";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
