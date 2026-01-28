import RequireLocation from "@/components/RequireLocation";
import Navigation from "../../components/navigation";
import ProductList from "../../components/product-list";

export default function SupplierProducts() {
  return (
    <RequireLocation>
      <title>Pova | Products</title>
      <Navigation />
      <ProductList from="supplier" />
    </RequireLocation>
  );
}
