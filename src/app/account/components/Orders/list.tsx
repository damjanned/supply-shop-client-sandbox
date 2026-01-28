"use client";
import useMinWidth from "@/hooks/useMinWidth";
import Loader from "@/components/Loader";
import VirtualisedList from "@/components/VirtualisedList";
import { formatPrice, getOrderStatus } from "@/lib/utils";
import { Order } from "@/types/order";
import dayjs from "dayjs";
import Link from "next/link";

type Props = {
  data?: { orders: Order[] };
  error?: any;
  loading?: boolean;
  loadMore: () => void;
  subsequentLoading: boolean;
  hasNextPage: boolean;
};

export default function OrderList({
  data,
  subsequentLoading,
  hasNextPage,
  loadMore,
  loading,
  error,
}: Props) {
  const { isLarger: isTab } = useMinWidth(768);
  const { isLarger: isDesktop } = useMinWidth(1024);
  return (
    <>
      <div className="mt-4 text-pova-heading font-bold">Your Orders</div>
      <div className="mt-3">
        {error ? (
          <div className="w-full h-[calc(100vh-213px)] !h-[calc(100svh-213px)] flex justify-center items-center -mx-5">
            <div>Something went wrong</div>
          </div>
        ) : loading ? (
          <div className="w-full h-[calc(100vh-213px)] !h-[calc(100svh-213px)] flex justify-center items-center -mx-5">
            <Loader size={100} />
          </div>
        ) : (
          <VirtualisedList<Array<Order>>
            data={data!.orders}
            isNextPageLoading={subsequentLoading}
            hasNextPage={hasNextPage}
            loadNextPage={loadMore}
            listProps={{
              width: "100%",
              height: window.innerHeight - 213,
              itemSize: 116,
            }}
            renderItem={OrderRow}
            numCols={isDesktop ? 3 : isTab ? 2 : 1}
            listEmptyText="No orders yet"
          />
        )}
      </div>
    </>
  );
}

function OrderRow(order: Order) {
  const date = dayjs(order.Order_Date).format("DD/MM/YYYY");
  const [pickups, deliveries] =
    order.Order_Delivery_Calculation.supplierCheckouts.reduce(
      (acc, curr) => {
        if (curr.type === "Delivery") {
          acc[1]++;
        } else {
          acc[0]++;
        }
        return acc;
      },
      [0, 0],
    );
  const { className, status } = getOrderStatus(order);

  return (
    <div className="pb-4" key={order._id}>
      <Link href={`/account?t=2&id=${order._id}`}>
        <div className="border-2 border-surface h-[100px] rounded-pova-lg px-3 py-2 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="text-sm font-semibold">
              {order.Order_Job_Reference || `# ${order.Order_Number}`}
            </div>
            <div className="text-lg font-semibold">
              {formatPrice(order.Order_Total_Price_GST).slice(1)}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="font-medium basis-[150px]">
              <div className="text-xs leading-tight">
                <span className="text-on-surface-variant">
                  Order Date:&nbsp;
                </span>
                <span>{date}</span>
              </div>
              {deliveries > 0 && (
                <div className="text-xs leading-tight">
                  <span className=" text-on-surface-variant">
                    Delivery:&nbsp;
                  </span>
                  <span>{deliveries}</span>
                </div>
              )}
              {pickups > 0 && (
                <div className="text-xs leading-tight">
                  <span className=" text-on-surface-variant">
                    Pick-Up:&nbsp;
                  </span>
                  <span>{pickups}</span>
                </div>
              )}
            </div>
            <div className="text-xs font-medium truncate shrink leading-tight">
              <span className="text-on-surface-variant">Status:&nbsp;</span>
              <span className={className}>{status}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
