"use client";
import { ProductSummary } from "@/types/product";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { selectCheckout } from "@/redux/app";
import { BLUR_URL } from "@/lib/utils";

type Props = {
  data: ProductSummary;
  from?: "supplier" | "category" | "search";
  catName?: string | null;
};

export default function ProductSummaryComponent({
  data: product,
  from = "search",
  catName,
}: Props) {
  const checkout = useAppSelector(selectCheckout);
  const url = catName
    ? `/products/${product._id}?f=${from}&cat=${catName}`
    : `/products/${product._id}?f=${from}`;
  return (
    <Link
      className="flex border-surface border-2 rounded-pova-lg w-full h-full"
      href={
        checkout.location
          ? encodeURI(url)
          : encodeURI(`/location?redirect=${url}`)
      }
    >
      <div className="w-[95px] min-h-[95px] grow-0 shrink-0">
        <Image
          src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${product.Image}`}
          alt="representative-product"
          className="object-cover rounded-tl-pova-lg rounded-bl-pova-lg w-full h-full"
          placeholder="blur"
          blurDataURL={BLUR_URL}
          sizes="140px"
          width={200}
          height={200}
        />
      </div>
      <div className="p-2 grow flex flex-col gap-y-2 justify-between">
        <div className="text-sm font-semibold">{product.Name}</div>
        <div className="text-xs font-medium text-on-surface-variant">
          <div>Colours: {product.Colours}</div>
          <div>Variants: {product.Variants}</div>
          {product.Cutting && <div>Custom Available </div>}
        </div>
      </div>
    </Link>
  );
}
