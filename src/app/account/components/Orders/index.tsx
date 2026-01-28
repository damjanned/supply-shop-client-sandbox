import { useSearchParams } from "next/navigation";
import OrderDetails from "./details";
import OrderList from "./list";
import useQuery from "@/hooks/useQuery";
import { useAppSelector } from "@/redux/hooks";
import { selectToken } from "@/redux/app";
import { Order } from "@/types/order";
import React from "react";

export default function Orders() {
  const query = useSearchParams();
  const id = query.get("id");
  const token = useAppSelector(selectToken);
  const [page, setPage] = React.useState(2);

  const { data, error, loading, loadMore, subsequentLoading } = useQuery<{
    data: { orders: Order[]; totalPages: number };
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user/getMany?limit=10&offset=1`,
    {
      token: token as string,
      merger: (prev, incoming) => {
        if (!prev) {
          return {
            data: {
              orders: incoming.data.orders,
              totalPages: incoming.data.totalPages,
            },
          };
        } else {
          return {
            data: {
              orders: [...prev.data.orders, ...incoming.data.orders],
              totalPages: incoming.data.totalPages,
            },
          };
        }
      },
    },
  );

  async function loadNextPage() {
    await loadMore(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user/getMany?limit=10&offset=${page}`,
    );
    setPage((curr) => curr + 1);
  }

  return id ? (
    <OrderDetails id={id} />
  ) : (
    <OrderList
      data={data?.data}
      error={error}
      loading={loading}
      subsequentLoading={subsequentLoading}
      hasNextPage={
        data?.data.totalPages ? data!.data.totalPages >= page : false
      }
      loadMore={loadNextPage}
    />
  );
}
