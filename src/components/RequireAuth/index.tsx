"use client";

import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React from "react";
import Loader from "../Loader";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const [pageState, setPageState] = React.useState<"indeterminate" | "allowed">(
    "indeterminate",
  );
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const pathname = usePathname();
  const query = useSearchParams();

  React.useEffect(() => {
    if (token) {
      setPageState("allowed");
    } else {
      router.replace(
        `/auth?next=${encodeURI(pathname + "?" + query.toString())}`,
      );
    }
  }, [token, router, pathname, query]);

  return (
    <div>
      {pageState === "allowed" ? (
        children
      ) : (
        <div className="w-full h-screen flex justify-center items-center -ml-5">
          <Loader size={100} />
        </div>
      )}
    </div>
  );
}
