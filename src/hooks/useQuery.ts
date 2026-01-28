import { createGetRequest } from "@/lib/network";
import { selectCache, setCache } from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { NetworkState } from "@/types/network-state";
import { useRouter } from "next/navigation";
import React from "react";

export default function useQuery<T>(
  url: string,
  config?: {
    token?: string;
    merger?: (prev: T | undefined, incoming: T) => T;
    cache?: {
      key: string;
      duration: number;
    };
  },
): {
  loading: boolean;
  error?: { message: string; status?: number };
  data?: T;
  loadMore: (url: string) => Promise<T | undefined>;
  subsequentLoading: boolean;
} {
  const [data, setData] = React.useState<T | undefined>();
  const [error, setError] = React.useState<
    { message: string; status?: number } | undefined
  >();
  const [networkState, setNetworkState] =
    React.useState<NetworkState>("progress");
  const token = config?.token;
  const dispatch = useAppDispatch();
  const cache = config?.cache;
  const cachedData = useAppSelector(
    selectCache(cache?.key ? `flashing/${cache.key}` : "flashing"),
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const merger = React.useMemo(() => config?.merger, []);
  const router = useRouter();
  const fetchData = React.useCallback(
    async function (url: string, token?: string, loadMore?: boolean) {
      setNetworkState(loadMore ? "loadMore" : "progress");
      const response = await createGetRequest<T>({ url, token });
      if (response.data) {
        setData((curr) => {
          const newData = merger
            ? merger(curr, response.data as T)
            : response.data;
          if (cache) {
            dispatch(
              setCache({
                key: cache.key,
                duration: cache.duration,
                data: newData,
              }),
            );
          }
          return newData;
        });
        setNetworkState("success");

        return response.data as T;
      } else {
        setError(response.error);
        setNetworkState("error");
        if (response.error!.status === 450) {
          router.replace("/no-service");
        }
      }
    },
    [merger, router, cache, dispatch],
  );
  const loadMore = React.useCallback(
    async (url: string) => {
      const response = await fetchData(url, token, true);
      return response;
    },
    [token, fetchData],
  );

  React.useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setNetworkState("success");
    } else {
      fetchData(url, token);
    }
  }, [url, token, fetchData, cachedData]);

  const loading = networkState === "progress";
  const subsequentLoading = networkState === "loadMore";
  return { data, error, loading, loadMore, subsequentLoading };
}
