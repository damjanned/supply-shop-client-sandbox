"use client";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function TermsLayout({ children }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];

  return (
    <PageContainer>
      <div className="flex -mx-5">
        <Link
          href="/terms/website"
          className={`w-1/2 text-xl leading-[26px] text-on-surface font-bold px-4 pt-[17px] pb-3 text-center border-b-[5px]  cursor-pointer ${
            lastSegment === "website"
              ? "text-primary border-b-primary"
              : "border-b-surface"
          }`}
        >
          Website Terms
        </Link>
        <Link
          href="/terms/trade"
          className={`w-1/2 text-xl leading-[26px] text-on-surface font-bold px-4 pt-[17px] pb-3 text-center border-b-[5px]  cursor-pointer ${
            lastSegment === "trade"
              ? "text-primary border-b-primary"
              : "border-b-surface"
          }`}
        >
          Terms of Trade
        </Link>
      </div>
      <div className="py-5">{children}</div>
    </PageContainer>
  );
}
