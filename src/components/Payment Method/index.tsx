import { BLUR_URL, formatPrice } from "@/lib/utils";
import { SecondaryButton } from "../Button";
import Image from "next/image";
export { default as PayID } from "./components/payid";

type Props = {
  user: string;
  limitAvailable: number;
  limitTotal: number;
  onPayNow: () => void;
  onPayCredit: () => void;
  creditLoading?: boolean;
};

type CreditProps = Pick<Props, "limitAvailable" | "limitTotal">;

export default function PaymentMethod({
  user,
  limitAvailable,
  limitTotal,
  onPayCredit,
  onPayNow,
  creditLoading,
}: Props) {
  return (
    <div className="h-full">
      <div className="text-pova-heading font-bold">Payment Method</div>
      <div className="rounded-pova-lg border-2 border-surface p-2.5 mt-7">
        <div className="font-semibold">Credit Limit for &quot;{user}&quot;</div>
        <div className="my-3.5">
          <CreditSlider
            limitAvailable={limitAvailable}
            limitTotal={limitTotal}
          />
        </div>
        <div className="text-center text-sm font-medium mb-4">
          <span className="text-success ">
            {formatPrice(limitAvailable).slice(1)}
          </span>{" "}
          / <span>{formatPrice(limitTotal).slice(1)}</span>
        </div>
        <SecondaryButton
          text="Pay With Credit Limit"
          fullWidth
          smallestRadius
          containerClasses="!font-bold"
          onClick={onPayCredit}
          disabled={creditLoading}
        />
      </div>
      <div className="rounded-pova-lg border-2 border-surface p-2.5 mt-8">
        <div className="flex mb-2.5 gap-x-2.5">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/card+logo+1.svg`}
            alt=""
            sizes="320px"
            placeholder="blur"
            className="w-36 min-[400px]:w-40"
            blurDataURL={BLUR_URL}
            width={160}
            height={90}
            unoptimized
          />
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/card+logo+2.svg`}
            alt=""
            sizes="320px"
            placeholder="blur"
            className="w-36 min-[400px]:w-40"
            blurDataURL={BLUR_URL}
            width={161}
            height={90}
            unoptimized
          />
        </div>
        <div className="text-center text-sm font-medium mb-4">
          * almost all international credit & debit cards
        </div>
        <SecondaryButton
          text="Pay Now"
          fullWidth
          smallestRadius
          containerClasses="!font-bold"
          onClick={onPayNow}
          disabled={creditLoading}
        />
      </div>
    </div>
  );
}

function CreditSlider({ limitAvailable, limitTotal }: CreditProps) {
  const fraction = limitAvailable / limitTotal;
  return (
    <div className="w-[calc(100%-30px)] h-3 bg-surface relative ml-[15px] rounded-md">
      <div
        className="absolute h-3 left-0 top-0 bg-primary rounded-md"
        style={{ width: `${fraction * 100}%` }}
      />
      {/* <div
        className={`absolute left-0 top-0 -translate-y-[11px] -translate-x-1/2 size-7 rounded-full ${
          fraction > 0.05 ? "bg-primary" : "bg-surface"
        }`}
      /> */}
      {/* <div
        className={`absolute right-0 top-0 -translate-y-[11px] translate-x-1/2 size-7 rounded-full ${
          fraction > 0.95 ? "bg-primary" : "bg-surface"
        }`}
      /> */}
    </div>
  );
}
