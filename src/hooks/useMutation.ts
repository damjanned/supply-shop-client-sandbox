import { createPostRequest } from "@/lib/network";
import type { NetworkState } from "@/types/network-state";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function useMutation<U, T>(config: {
  url: string;
  token?: string;
}): [
  (body?: U) => Promise<{
    data?: T;
    error?: { message: string; status?: number; extraData?: any };
  }>,
  {
    data?: T;
    error?: { message: string; status?: number; extraData?: any };
    loading: boolean;
  },
] {
  const [data, setData] = React.useState<any>();
  const [networkState, setNetworkState] = React.useState<NetworkState>("idle");
  const router = useRouter();

  async function executor(body?: any) {
    setNetworkState("progress");
    const response = await createPostRequest<T>({ ...config, body });
    if (response.data) {
      setData(response.data);
      setNetworkState("success");
    } else {
      setData(response.error);
      setNetworkState("error");
      if (response.error!.status === 450) {
        router.replace("/no-service");
      }
    }
    return { data: response.data, error: response.error };
  }
  const responseData = networkState === "success" ? data : undefined;
  const responseError = networkState === "error" ? data : undefined;
  const loading = networkState === "progress";
  return [executor, { data: responseData, error: responseError, loading }];
}
