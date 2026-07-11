import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import SyncBridgeClient from "@/components/SyncBridgeClient";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Pesha's Bake Shop | Premium Cake Delivery Colombo",
  description: "Order delicious bento cakes, cupcakes, and custom birthday/anniversary cakes online from Pesha's Bake Shop in Kaduwela, Sri Lanka. Fast Colombo delivery.",
  keywords: ["cake delivery Colombo", "bento cake Sri Lanka", "Pesha's Bake Shop Kaduwela", "cupcakes Colombo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <CartProvider>
          {children}
          <MobileBottomNav />
          <SyncBridgeClient />
        </CartProvider>
      </body>
    </html>
  );
}
