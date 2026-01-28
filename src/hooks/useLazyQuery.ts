import { createGetRequest } from "@/lib/network";
import type { NetworkState } from "@/types/network-state";
import { useRouter } from "next/navigation";
import React from "react";

export default function useLazyQuery<T>(
  url: string,
  config?: { token?: string; onComplete?: (data?: T) => void },
): [
  (newUrl?: string) => Promise<{
    data?: T;
    error?: { message: string; status?: number; extraData?: any };
  }>,
  {
    loading: boolean;
    error?: { message: string; status?: number };
    data?: T;
  },
] {
  const [data, setData] = React.useState<T | undefined>();
  const [error, setError] = React.useState<
    { message: string; status?: number } | undefined
  >();
  const [networkState, setNetworkState] = React.useState<NetworkState>("idle");
  const token = config?.token;
  const router = useRouter();
  async function fetchData(newUrl?: string) {
    setNetworkState("progress");
    const response = await createGetRequest<T>({ url: newUrl || url, token });
    if (response.data) {
      setData(response.data);
      setNetworkState("success");
    } else {
      setError(response.error);
      setNetworkState("error");
      if (response.error!.status === 450) {
        router.replace("/no-service");
      }
    }
    if (config?.onComplete) {
      config.onComplete(response.data);
    }
    return { data: response.data, error: response.error };
  }
  const loading = networkState === "progress";
  return [fetchData, { data, error, loading }];
}
