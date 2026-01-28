"use client";

import { Industry } from "@/types/industry";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MdArrowLeft } from "react-icons/md";
import Selector from "../../../../components/selector";
import SearchableList from "@/components/SearchableList";
import { ProductSummary } from "@/types/product";
import ProductSummaryComponent from "@/components/ProductSummary";
import CategoryRow from "./category-row";
import { Category } from "@/types/category";
import { selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import useMinWidth from "@/hooks/useMinWidth";

type Props = {
  industry: Industry;
  id: string;
};

export default function CategoryList({ industry, id }: Props) {
  const query = useSearchParams();
  const industryName = query.get("s");
  const category = query.get("ss");
  const checkout = useAppSelector(selectCheckout);
  const url = category
    ? `/shop/industry?s=${encodeURIComponent(
        industryName as string,
      )}&sid=${id}&ss=${encodeURIComponent(category)}`
    : `/shop/industry?s=${encodeURIComponent(industryName as string)}`;

  let searchUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?industry=${id}&limit=30&`;

  if (checkout.location) {
    searchUrl = `${searchUrl}location=${checkout.location}&`;
  }
  searchUrl = `${searchUrl}q=`;

  const { isLarger: isTab, viewport: mvw } = useMinWidth(768);
  const { isLarger: isDesktop } = useMinWidth(1024);
  const { isLarger, viewport } = useMinWidth(352);
  let itemHeight: string = "";

  if (isDesktop) {
    const itemWidth = 948 / 4;
    itemHeight = (0.588 * itemWidth).toFixed(0);
  } else if (isTab) {
    const itemWidth = (mvw - 64) / 3;
    itemHeight = (0.588 * itemWidth).toFixed(0);
  } else if (isLarger) {
    const itemWidth = (viewport - 52) / 2;
    itemHeight = (0.588 * itemWidth).toFixed(0);
  }

  return (
    <>
      <div className="flex gap-x-1 mb-5 mt-5">
        <Link
          href="/shop/industry"
          className="h-12 w-12 rounded-full bg-surface flex justify-center items-center text-2xl"
        >
          <MdArrowLeft />
        </Link>
        <Selector text={industryName as string} link={url} />
        {category && <Selector text={category} active link="#" />}
      </div>
      <div className="pb-4 h-[calc(100vh-137px)] !h-[calc(100svh-137px)]">
        <SearchableList<
          { group: string; items: Array<ProductSummary> },
          Category & { industryId: string; industryName: string }
        >
          emptyListDetails={{
            initialData: industry.Categories.map((cat) => ({
              ...cat,
              industryId: id,
              industryName: industryName as string,
            })),
            InitialDataComponent: CategoryRow,
            containerClass: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
            customItemHeight: itemHeight,
          }}
          searchUrl={searchUrl}
          title="Categories"
          ratio={0.284}
          RowComponent={ProductSummaryComponent}
          group
          placeholder={`Search for ${industryName} products`}
        />
      </div>
    </>
  );
}
