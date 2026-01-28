import { PrimaryButton } from "@/components/Button";
import Copy from "@/components/Icons/Copy";
import Radio from "@/components/Radio";
import { BLUR_URL } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  error?: {
    message: string;
  };
  loading?: boolean;
  data?: {
    data: {
      payIdAddress: string;
      reservedUntil: string;
    };
  };
  onConfirm: () => void;
};

export default function PayID({
  checked,
  onChange,
  disabled,
  error,
  loading,
  data: payIDData,
  onConfirm,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [remaining, setRemaining] = useState(59);

  useEffect(() => {
    let id: NodeJS.Timeout;
    if (payIDData?.data?.reservedUntil) {
      const reserved = dayjs(payIDData.data.reservedUntil);
      const minutes = Math.max(0, reserved.diff(dayjs(), "minute"));
      setRemaining(minutes);

      if (minutes <= 0) return;

      id = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            return 0;
          }
          return prev - 1;
        });
      }, 60_000);
    }
    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [payIDData?.data?.reservedUntil]);

  return (
    <div className="border-2 border-surface rounded-pova-lg py-3.5 px-2.5 ">
      <div className="flex gap-x-2.5">
        <Radio
          checked={checked}
          onChange={onChange}
          label={
            <div className="flex gap-x-2.5 items-center cursor-pointer">
              <span className="font-semibold">Pay ID</span>
              <span className="text-on-surface-variant font-semibold text-sm">
                ($0 fee)
              </span>
            </div>
          }
          type="radio"
          containerClasses="!gap-x-2.5 grow"
          labelContainerClases="block w-full"
          disabled={disabled}
          id="method-payID"
        />
        <div className="grow-0 shrink-0">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/payid.webp`}
            alt="PayID logo"
            sizes="52px"
            placeholder="blur"
            className="object-cover"
            blurDataURL={BLUR_URL}
            width={52}
            height={25}
            unoptimized
          />
        </div>
      </div>
      {checked && (
        <div>
          {error ? (
            <div className="mt-2.5">
              {error.message || "Something went wrong"}
            </div>
          ) : loading ? (
            <div className="mt-2.5 h-48 animate-pulse bg-on-surface/60 rounded-pova-lg" />
          ) : (
            <div className="mt-2.5">
              <div className="font-semibold">
                Please make a PayID payment to:
              </div>
              <div className="mt-2.5 text-xs">
                *Make a payment using your banking app (online banking) via
                PayID at the following e-mail address:
              </div>
              <div className="my-4 bg-surface rounded-pova-lg text-center px-3 py-4 font-bold text-on-surface-variant relative">
                {payIDData!.data.payIdAddress}
                <Copy
                  className="absolute top-4 right-4 text-primary cursor-pointer"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        payIDData!.data.payIdAddress,
                      );
                    } catch {
                      const textarea = document.createElement("textarea");
                      textarea.value = payIDData!.data.payIdAddress;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand("copy");
                      document.body.removeChild(textarea);
                    } finally {
                      alert("Copied to clipboard");
                    }
                  }}
                />
              </div>
              <div className="my-4">
                <PrimaryButton
                  text={
                    confirming
                      ? "Verifying Payment..."
                      : "I have Made the Payment"
                  }
                  onClick={() => {
                    setConfirming(true);
                    onConfirm();
                  }}
                  fullWidth
                  disabled={confirming}
                />
              </div>
              <div className="text-[0.625rem] font-bold">
                It&apos;s valid until:{" "}
                {dayjs(payIDData!.data.reservedUntil).format(
                  "DD/MM/YYYY hh:mm:ss a",
                )}{" "}
                ({remaining} minutes remaining)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
