"use client";
import { useSearchParams } from "next/navigation";
import Selector from "../../components/selector";

export default function Navigation() {
  const query = useSearchParams();
  const industry = query.get("s");
  const category = query.get("ss");
  const sid = query.get("sid");

  return industry ? (
    <div className="flex gap-x-1 my-3.5">
      <Selector text={industry as string} link="#" active />
      {category && (
        <Selector
          text={category}
          link={`/shop/industry/${sid}/category?s=${encodeURIComponent(
            industry,
          )}&ss=${encodeURIComponent(category)}`}
        />
      )}
    </div>
  ) : (
    <div className="mt-2 text-pova-heading font-bold">Shop</div>
  );
}
