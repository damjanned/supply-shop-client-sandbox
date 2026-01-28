"use client";

import Loader from "@/components/Loader";
import PageContainer from "@/components/PageContainer";
import PaymentMethod from "@/components/Payment Method";
import RequireAuth from "@/components/RequireAuth";
import useMutation from "@/hooks/useMutation";
import useQuery from "@/hooks/useQuery";
import { formatPrice } from "@/lib/utils";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { Order } from "@/types/order";
import { useParams, useRouter } from "next/navigation";

export default function OrderPaymentMethod() {
  const { id } = useParams();
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const { error, loading, data } = useQuery<{ data: Order }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user/getOne/${id}`,
    { token },
  );
  const [pay, { loading: creditLoading }] = useMutation<
    { invoiceID: string; paymentType: "CreditLimit" },
    any
  >({
    token,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/user/pay`,
  });

  async function processPayment() {
    const { error } = await pay({
      invoiceID: data!.data.Order_Invoice._id,
      paymentType: "CreditLimit",
    });
    if (error) {
      const errorMessage = error.message || "Something went wrong";
      alert(errorMessage);
    } else {
      router.replace(`/account?t=2&id=${data!.data._id}`);
    }
  }

  return (
    <RequireAuth>
      <PageContainer>
        {error ? (
          <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
            <div>Something went wrong</div>
          </div>
        ) : loading ? (
          <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
            <Loader size={100} />
          </div>
        ) : (
          <div className="h-[calc(100vh-138x)] !h-[calc(100svh-138px)] overflow-y-auto -mx-5 px-5">
            <PaymentMethod
              user={
                data!.data.Order_Customer.Customer.Customer_Business_Name ||
                data!.data.Order_Customer.Customer.Customer_Name
              }
              limitAvailable={
                data!.data.Order_Customer.Customer
                  .Credit_Limit_Available_Amount as number
              }
              limitTotal={
                data!.data.Order_Customer.Customer.Credit_Limit_Amount as number
              }
              onPayNow={() => router.push(`/order/${data!.data._id}/payment`)}
              onPayCredit={processPayment}
              creditLoading={creditLoading}
            />
            <div className="fixed md:absolute border-t-surface border-t-4 bottom-0 left-0 right-0 md:-left-5 md:-right-5 p-5 flex justify-between items-center font-bold text-2xl">
              <div>Remaining</div>
              <div>
                {formatPrice(
                  data!.data.Order_Invoice.Invoice_Amount_Outstanding,
                ).slice(1)}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </RequireAuth>
  );
}
