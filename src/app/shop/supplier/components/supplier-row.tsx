"use client";
import { Supplier } from "@/types/supplier";
import Link from "next/link";
import Image from "next/image";
import { BLUR_URL } from "@/lib/utils";

type Props = {
  data: Supplier;
};

export default function SupplierRow({ data: supplier }: Props) {
  return (
    <Link
      href={`/shop/supplier/${supplier._id}?s=${encodeURIComponent(
        supplier.Supplier_Name,
      )}`}
      className="block w-full h-full relative"
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${supplier.Supplier_Image}`}
        fill
        alt="preview"
        className="rounded-pova-lg object-cover"
        sizes=" (min-width: 1024px) 35vw, (min-width: 768px) 50vw, 100vw"
        placeholder="blur"
        blurDataURL={BLUR_URL}
      />
      <span className="absolute text-white font-bold top-2 left-3">
        {supplier.Supplier_Name}
      </span>
    </Link>
  );
}
