"use client";

import { selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Loader from "../Loader";
import PageContainer from "../PageContainer";

type Props = {
  children: React.ReactNode;
  noContainer?: boolean;
};

export default function RequireLocation({ children, noContainer }: Props) {
  const [locationAdded, setLocationAdded] = React.useState<
    "indeterminate" | "yes"
  >("indeterminate");
  const router = useRouter();
  const checkout = useAppSelector(selectCheckout);
  const pathname = usePathname();
  const query = useSearchParams();

  React.useEffect(() => {
    if (checkout.location) {
      setLocationAdded("yes");
    } else {
      router.replace(
        `/location?redirect=${encodeURI(pathname + "?" + query.toString())}`,
      );
    }
  }, [checkout.location, router, pathname, query]);

  return !noContainer ? (
    <PageContainer>
      {locationAdded === "yes" ? (
        children
      ) : (
        <div className="w-full h-[calc(100vh-61px)] !h-[calc(100svh-61px)] flex justify-center items-center -ml-5">
          <Loader size={100} />
        </div>
      )}
    </PageContainer>
  ) : (
    <>
      {locationAdded === "yes" ? (
        children
      ) : (
        <div className="w-full h-[calc(100vh-61px)] !h-[calc(100svh-61px)] flex justify-center items-center">
          <Loader size={100} />
        </div>
      )}
    </>
  );
}
