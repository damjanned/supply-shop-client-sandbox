import ProductList from "../../../../components/product-list";
import RequireLocation from "@/components/RequireLocation";
import Navigation from "../../../../components/navigation";

export default function CategoryProducts() {
  return (
    <RequireLocation>
      <title>Pova | Products</title>
      <Navigation />
      <ProductList from="category" />
    </RequireLocation>
  );
}
