"use client";

import { useParams, useSearchParams } from "next/navigation";
import Selector from "./selector";
import Link from "next/link";
import { MdArrowLeft } from "react-icons/md";

export default function Navigation() {
  const query = useSearchParams();
  const params = useParams();
  const selectors: Array<{ text: string; link: string }> = [];

  let backLink = "/shop/supplier";
  if (!params.categoryId) {
    selectors.push({
      text: query.get("s") as string,
      link: `/shop/supplier?s=${encodeURIComponent(query.get("s") as string)}`,
    });
  } else {
    const industryName = query.get("s");
    const categoryName = query.get("ss");
    const id = params.id;
    selectors.push({
      text: industryName as string,
      link: `/shop/industry?s=${encodeURIComponent(
        industryName as string,
      )}&ss=${encodeURIComponent(categoryName as string)}&sid=${id}`,
    });

    selectors.push({
      text: categoryName as string,
      link: `/shop/industry/${id}/category?s=${encodeURIComponent(
        industryName as string,
      )}&ss=${encodeURIComponent(categoryName as string)}`,
    });
    backLink = `/shop/industry/${id}/category?s=${encodeURIComponent(
      industryName as string,
    )}&ss=${encodeURIComponent(categoryName as string)}`;
  }

  return (
    <div className="flex gap-x-1 mb-5 mt-5">
      <Link
        href={backLink}
        className="h-12 w-12 rounded-full bg-surface flex justify-center items-center text-2xl"
      >
        <MdArrowLeft />
      </Link>
      {selectors.map((selector) => (
        <Selector
          text={selector.text}
          link={selector.link}
          key={selector.link}
        />
      ))}
    </div>
  );
}
