"use client";
import { SecondaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import PageContainer from "@/components/PageContainer";
import RequireAuth from "@/components/RequireAuth";
import useQuery from "@/hooks/useQuery";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { Order } from "@/types/order";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import useMutation from "@/hooks/useMutation";
import { PayID } from "@/components/Payment Method";
import useLazyQuery from "@/hooks/useLazyQuery";
import Card from "@/components/Payment Method/components/card";

export default function OrderPayment() {
  const [method, setMethod] = useState<"payID" | "card" | null>(null);
  const token = useAppSelector(selectToken);
  const { id } = useParams();
  const { error, loading, data } = useQuery<{ data: Order }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user/getOne/${id}`,
    { token },
  );
  const [
    payIDExecutor,
    { error: payIDError, loading: payIDLoading, data: payIDData },
  ] = useMutation<
    undefined,
    {
      data: { payIdAddress: string; reservedUntil: string };
    }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/pay/payID/${data?.data._id}`,
    token,
  });
  const [payIDPoll, { loading: payIDPolling }] = useLazyQuery<{
    data: { isProcessed: boolean };
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/pay/payID/${data?.data._id}`,
    { token },
  );
  const [payWithCCExecutor, { loading: ccProcessing }] = useMutation<
    {
      sourceId: string;
    },
    any
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/pay/square/${data?.data._id}`,
    token,
  });
  const router = useRouter();
  const query = useSearchParams();
  const next = query.get("next");

  async function confirmPayID() {
    let delay = 1;
    let increment = false;
    async function poll() {
      const { data, error } = await payIDPoll();
      if (error) {
        alert("Something went wrong, please refresh page");
      } else if (data) {
        if (data.data.isProcessed) {
          if (next) {
            router.replace(`/order/success`);
          } else {
            router.back();
          }
        } else {
          if (increment) {
            delay++;
            delay = Math.max(delay, 10);
          }
          increment = !increment;
          setTimeout(poll, delay * 1000);
        }
      }
    }
    poll();
  }

  async function payWithCC(data: { token: string }) {
    const { error } = await payWithCCExecutor({
      sourceId: data.token,
    });
    if (error) {
      const errorMessage = error.message || "Something went wrong";
      alert(errorMessage);
    } else {
      if (next) {
        router.replace(`/order/success`);
      } else {
        router.back();
      }
    }
  }

  const payIDProcessing = payIDLoading || payIDPolling;
  const cardProcessing = ccProcessing;

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
          <div className="h-[calc(100vh-61x)] !h-[calc(100svh-61px)] overflow-y-auto -mx-5 px-5 relative pb-24">
            <div className="flex justify-between items-center mt-4">
              <div className="font-bold text-pova-heading">Payment</div>
              <SecondaryButton
                text="View Order"
                link={`/account?t=2&id=${id}`}
              />
            </div>
            <div className="space-y-2.5 mt-9">
              <PayID
                checked={method === "payID"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMethod("payID");
                    payIDExecutor();
                  }
                }}
                disabled={cardProcessing}
                error={payIDError}
                data={payIDData}
                loading={payIDLoading}
                onConfirm={confirmPayID}
              />
              <Card
                checked={method === "card"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMethod("card");
                  }
                }}
                disabled={payIDProcessing}
                amount={data!.data.Order_Invoice.Invoice_Amount_Outstanding}
                processPayment={payWithCC}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t-[7px] border-b-surface px-5 border-t-surface fixed bottom-0 left-0 w-full max-w-screen-lg lg:absolute">
              <div className="font-bold text-xl">Remaining</div>
              <div className="font-bold text-xl">
                $
                {data!.data.Order_Invoice.Invoice_Amount_Outstanding.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </RequireAuth>
  );
}
