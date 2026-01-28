"use client";
import RequireLocation from "@/components/RequireLocation";
import ProductDetails from "./components/ProductDetails";

export default function ProductPage() {
  return (
    <RequireLocation>
      <ProductDetails />
    </RequireLocation>
  );
}
