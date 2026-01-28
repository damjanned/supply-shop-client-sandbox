"use client";
import SearchableList from "@/components/SearchableList";
import { ProductSummary } from "@/types/product";
import { Industry } from "@/types/industry";
import IndustryRow from "./industry-row";
import { selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import ProductSummaryComponent from "@/components/ProductSummary";

type Props = {
  industries?: Array<Industry>;
};

export default function IndustryList({ industries }: Props) {
  const checkout = useAppSelector(selectCheckout);

  let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=30&`;

  if (checkout.location) {
    url = `${url}location=${checkout.location}&`;
  }
  url = `${url}q=`;

  return (
    <div className="pb-4 h-[calc(100vh-137px)] !h-[calc(100svh-137px)]">
      <SearchableList<{ group: string; items: Array<ProductSummary> }, Industry>
        emptyListDetails={{
          initialData: industries || [],
          InitialDataComponent: IndustryRow,
        }}
        searchUrl={url}
        title="Industries"
        ratio={0.284}
        RowComponent={ProductSummaryComponent}
      />
    </div>
  );
}
