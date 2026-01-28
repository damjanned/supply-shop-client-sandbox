"use client";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { selectOrderId } from "@/redux/app";
import { selectDetails } from "@/redux/auth";
import { useAppSelector } from "@/redux/hooks";
import { FaCheckCircle } from "react-icons/fa";

export default function OrderSuccess() {
  const userDetails = useAppSelector(selectDetails);
  const orderId = useAppSelector(selectOrderId);
  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        <div className="h-[calc(100vh-177px)] !h-[calc(100svh-177px)] flex flex-col justify-center items-center py:2 md:py-6">
          <div className="font-bold text-2xl md:text-3xl mb-5 md:mb-16 md:w-1/2 lg:w-1/3 text-center">
            {userDetails?.name || "User"}, your order has been placed
            successfully!
          </div>
          <div className="mb-5 md:mb-16 text-[120px] md:text-[150px]">
            <FaCheckCircle />
          </div>
          <div className="font-bold text-lg text-center md:w-1/3 lg:w-1/4">
            Delivery details and invoice available via Email & SMS
          </div>
        </div>
        <div className="fixed md:absolute left-5 right-5 bottom-4">
          <PrimaryButton
            text="Continue Shopping"
            link="/shop/industry"
            fullWidth
          />
          <div className="mt-4">
            <SecondaryButton
              text="View My Order"
              link={`/account?t=2&id=${orderId}`}
              fullWidth
              smallestRadius
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
