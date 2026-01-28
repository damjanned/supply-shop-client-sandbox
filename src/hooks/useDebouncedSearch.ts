import { debounce } from "lodash";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function useDebouncedSearch<T>(
  callback: (value: string, router: AppRouterInstance) => Promise<T>,
  period: number = 300,
  initialValues?: { search: string; results: T },
) {
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState(initialValues?.search || "");
  const [results, setResults] = React.useState<T>(
    initialValues?.results as any,
  );
  const router = useRouter();
  const debouncedCallback = React.useCallback(
    debounce(async (value: string) => {
      const response = await callback(value, router);
      setLoading(false);
      setResults(response);
    }, period),
    [router, callback],
  );

  async function onSearchChange(newSearch: string) {
    setSearch(newSearch);
    setLoading(true);
    debouncedCallback(newSearch);
  }

  return { search, results, onSearchChange, loading };
}
