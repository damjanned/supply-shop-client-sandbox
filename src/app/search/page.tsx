"use client";
import PageContainer from "@/components/PageContainer";
import ProductSummaryComponent from "@/components/ProductSummary";
import SearchableList from "@/components/SearchableList";
import Snackbar from "@/components/Snackbar";
import { getAllItemsPrice } from "@/lib/utils";
import { selectCart, selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { ProductSummary } from "@/types/product";
import { useRouter } from "next/navigation";

export default function Search() {
  const checkout = useAppSelector(selectCheckout);
  const cart = useAppSelector(selectCart);
  const router = useRouter();
  let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=30&`;

  if (checkout.location) {
    url = `${url}location=${checkout.location}&`;
  }
  url = `${url}q=`;

  return (
    <PageContainer>
      <title>Pova | Search for products</title>
      <div
        className={`relative pt-4 ${
          cart.length > 0 ? "pb-20" : "pb-4"
        } h-[calc(100vh-61px)] !h-[calc(100svh-61px)]`}
      >
        <SearchableList<{ group: string; items: Array<ProductSummary> }, any>
          searchUrl={url}
          RowComponent={ProductSummaryComponent}
          autoFocus
          compactContent
          persist
        />
        {cart.length > 0 && (
          <div className="fixed md:absolute bottom-4 left-5 md:left-0 right-5 md:right-0">
            <Snackbar
              message={getAllItemsPrice(cart)}
              actionText={`Go to Cart (${cart.length})`}
              onClick={() => router.push("/checkout")}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
