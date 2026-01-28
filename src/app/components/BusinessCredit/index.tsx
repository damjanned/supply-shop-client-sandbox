"use client";

import { SecondaryButton } from "@/components/Button";
import useQuery from "@/hooks/useQuery";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import type { CustomerProfile } from "@/types/customer";

export default function BusinessCredit() {
  const token = useAppSelector(selectToken);
  const { data, loading } = useQuery<{ data: CustomerProfile }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customer/profile`,
    {
      token: token as string,
    },
  );

  if (loading || (data && data.data.Business?.Credit_Limit_Amount)) {
    return null;
  } else {
    return (
      <div className="bg-white rounded-pova-lg shadow-pova-sm py-2 px-3">
        <div className="font-bold">Pova Business Credit</div>
        <div className="mt-2.5 text-sm font-light">
          We offer a Business Credit Limit for eligible{" "}
          <span className="font-medium">business accounts & sole traders.</span>
        </div>
        <div className="mt-2">
          <SecondaryButton text="Apply Here" link="/business/credit-limit" />
        </div>
      </div>
    );
  }
}
