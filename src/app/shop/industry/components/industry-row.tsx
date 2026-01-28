"use client";

import { Industry } from "@/types/industry";
import Link from "next/link";
import Image from "next/image";
import { BLUR_URL } from "@/lib/utils";

type Props = {
  data: Industry;
};

export default function IndustryRow({ data: industry }: Props) {
  return (
    <Link
      href={`/shop/industry/${industry._id}/category?s=${encodeURIComponent(
        industry.Industry_Name,
      )}`}
      className="block w-full h-full relative"
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${industry.Industry_Image}`}
        fill
        alt="preview"
        className="rounded-pova-lg object-cover"
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        placeholder="blur"
        blurDataURL={BLUR_URL}
      />
      <span className="absolute text-white font-bold top-2 left-3">
        {industry.Industry_Name}
      </span>
    </Link>
  );
}
