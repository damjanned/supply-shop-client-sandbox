import { Product } from "@/types/product";
import Image from "next/image";
import BackFAB from "../BackFAB";
import { BLUR_URL } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type Props = {
  product: Product;
  from: "supplier" | "category" | "search" | "cart";
};

export default function ProductSummary({ product, from }: Props) {
  const query = useSearchParams();
  const cost = product.Branch_Item_Variants.reduce(
    (acc, curr) => Math.min(acc, curr.Variant_Selling_Price),
    Number.MAX_SAFE_INTEGER,
  );

  return (
    <div className="lg:flex lg:flex-row">
      <div className="relative w-full lg:basis-[24.5625rem] h-[15.125rem] lg:pt-8">
        <Image
          fill
          src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${product.Branch_Item.Item_Image_Large}`}
          className="object-cover"
          alt="product preview"
          sizes="(min-width: 1024px) 400px, 100vw"
          placeholder="blur"
          blurDataURL={BLUR_URL}
        />
        <BackFAB
          text={
            from === "supplier"
              ? product.Branch_Item.Item_Supplier.Supplier_Name
              : from === "category"
              ? (query.get("cat") as string)
              : from === "search"
              ? "Search Items"
              : "Cart"
          }
        />
      </div>
      <div className="lg:pt-8 lg:basis-[calc(100%-24.5625rem)]">
        <div className="mt-4 px-5 font-bold text-2xl lg:text-4xl">
          {product.Branch_Item.Item_Name}
        </div>
        <div className="px-5 font-bold text-2xl lg:text-4xl">
          ${cost.toFixed(2)}
        </div>
        <p className="px-5 mt-4 font-light text-sm lg:text-normal">
          {product.Branch_Item.Item_Description}
        </p>
      </div>
    </div>
  );
}
