import Radio from "@/components/Radio";
import { BLUR_URL } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import {
  PaymentForm,
  CreditCard,
  ApplePay,
  //@ts-ignore
} from "react-square-web-payments-sdk";

type Props = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  amount: number;
  processPayment: (data: { token: string }) => void;
};

export default function Card({
  checked,
  onChange,
  disabled,
  amount,
  processPayment,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-surface rounded-pova-lg py-3.5 px-2.5 ">
      <div className="flex gap-x-2.5">
        <Radio
          checked={checked}
          onChange={(e) => {
            setExpanded(e.target.checked);
            onChange(e);
          }}
          label={
            <div className="flex gap-x-2.5 items-center cursor-pointer">
              <span className="font-semibold">Credit Card</span>
              <span className="text-on-surface-variant font-semibold text-sm">
                ($0 fee)
              </span>
            </div>
          }
          type="radio"
          containerClasses="!gap-x-2.5 grow"
          labelContainerClases="block w-full"
          disabled={disabled}
          id="method-card"
        />
        <div className="grow-0 shrink-0 flex items-center gap-x-2.5">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/mc.webp`}
            alt="Master Card Logo"
            sizes="33px"
            placeholder="blur"
            className="object-cover w-[33px]"
            blurDataURL={BLUR_URL}
            width={99}
            height={61}
            unoptimized
          />
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/visa.webp`}
            alt="Amex logo"
            sizes="38px"
            placeholder="blur"
            className="object-cover w-[38px]"
            blurDataURL={BLUR_URL}
            width={114}
            height={36}
            unoptimized
          />
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/amex.webp`}
            alt="Amex logo"
            sizes="39px"
            placeholder="blur"
            className="object-cover w-[39px]"
            blurDataURL={BLUR_URL}
            width={117}
            height={45}
            unoptimized
          />
        </div>
      </div>
      {checked && expanded && (
        <div className="mt-8">
          <PaymentForm
            applicationId={process.env.NEXT_PUBLIC_APP_ID}
            locationId={process.env.NEXT_PUBLIC_LOCATION_ID}
            cardTokenizeResponseReceived={processPayment}
            createPaymentRequest={() => ({
              countryCode: "AU",
              currencyCode: "AUD",
              total: {
                amount: amount.toFixed(2),
                label: "Total",
              },
            })}
          >
            <CreditCard
              style={{
                input: {
                  backgroundColor: "#EEEEEE",
                  color: "black",
                  fontWeight: "600",
                },
                "input::placeholder": {
                  color: "#6B6B6B",
                },
              }}
              buttonProps={{
                css: {
                  fontWeight: 700,
                  backgroundColor: "black",
                  borderRadius: "0.5rem",
                  "&:disabled": {
                    backgroundColor: "#515151",
                  },
                },
              }}
            >
              Confirm Payment
            </CreditCard>
            <ApplePay />
          </PaymentForm>
        </div>
      )}
    </div>
  );
}
