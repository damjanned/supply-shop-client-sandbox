"use client";

import { useSearchParams } from "next/navigation";
import Selector from "../../components/selector";

export default function Navigation() {
  const query = useSearchParams();
  const supplier = query.get("s");

  return supplier ? (
    <div className="my-3.5 inline-block">
      <Selector text={supplier as string} link="#" active />
    </div>
  ) : (
    <div className="mt-2 text-pova-heading font-bold">Shop</div>
  );
}
