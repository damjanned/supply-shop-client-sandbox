"use client";
import SearchableList from "@/components/SearchableList";
import { ProductSummary } from "@/types/product";
import type { Supplier as Sup } from "@/types/supplier";
import SupplierRow from "./supplier-row";
import { selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import ProductSummaryComponent from "@/components/ProductSummary";

type Props = {
  suppliers?: Array<Sup>;
};

export default function SupplierList({ suppliers }: Props) {
  const checkout = useAppSelector(selectCheckout);

  let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=30&`;

  if (checkout.location) {
    url = `${url}location=${checkout.location}&`;
  }
  url = `${url}q=`;

  return (
    <div className="pb-4 h-[calc(100vh-137px)] !h-[calc(100svh-137px)] !h-[calc(100dvh-137px)]">
      <SearchableList<{ group: string; items: Array<ProductSummary> }, Sup>
        emptyListDetails={{
          initialData: suppliers || [],
          InitialDataComponent: SupplierRow,
        }}
        searchUrl={url}
        title="Suppliers"
        ratio={0.284}
        RowComponent={ProductSummaryComponent}
      />
    </div>
  );
}
