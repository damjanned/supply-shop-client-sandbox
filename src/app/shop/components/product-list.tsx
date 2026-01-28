"use client";
import Loader from "@/components/Loader";
import ProductSummaryComponent from "@/components/ProductSummary";
import Searchbar from "@/components/Searchbar";
import Snackbar from "@/components/Snackbar";
import useDebouncedSearch from "@/hooks/useDebouncedSearch";
import useQuery from "@/hooks/useQuery";
import { getAllItemsPrice } from "@/lib/utils";
import { selectCart, selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { ProductSummary } from "@/types/product";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

type Props = {
  from: "supplier" | "category";
};

type ProductsResponse = {
  data: {
    items: Array<{
      group: string;
      items: Array<ProductSummary>;
      currentPage: number;
      totalPages: number;
    }>;
    suppliers?: Array<{
      _id: string;
      Supplier_Name: string;
    }>;
  };
};

function merger(
  prev: ProductsResponse | undefined,
  incoming: ProductsResponse,
) {
  if (!prev) {
    return incoming;
  } else {
    const prevGroupToItems = prev.data.items.reduce(
      (acc, curr) => {
        acc[curr.group] = curr.items;
        return acc;
      },
      {} as { [key: string]: Array<ProductSummary> },
    );
    return {
      data: {
        items: incoming.data.items.map((record) => ({
          totalPages: record.totalPages,
          group: record.group,
          currentPage: record.currentPage,
          items: [...(prevGroupToItems[record.group] || []), ...record.items],
        })),
        suppliers: prev.data.suppliers || [],
      },
    };
  }
}

function getHeightClasses(cartLength: number, suppliers?: Array<any>) {
  if (cartLength > 0 && suppliers && suppliers.length > 1) {
    return "h-[calc(100vh-361px)] !h-[calc(100svh-361px)]";
  } else if (cartLength > 0) {
    return "h-[calc(100vh-304px)] !h-[calc(100svh-304px)]";
  } else if (suppliers && suppliers.length > 1) {
    return "h-[calc(100vh-297px)] !h-[calc(100svh-297px)]";
  } else {
    return "h-[calc(100vh-240px)] !h-[calc(100svh-240px)]";
  }
}

export default function ProductList({ from }: Props) {
  const params = useParams();
  const pageQuery = useSearchParams();
  const catName = pageQuery.get("ss");
  const supplierName = pageQuery.get("s");
  let query: string;
  if (params.categoryId) {
    query = `industry=${params.id}&category=${params.categoryId}`;
  } else {
    query = `supplier=${params.id}`;
  }
  const [supplier, setSupplier] = React.useState("all");
  if (supplier !== "all") {
    query += `&supplier=${supplier}`;
  }
  const checkout = useAppSelector(selectCheckout);
  const { loading, error, data, loadMore, subsequentLoading } =
    useQuery<ProductsResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=20&location=${checkout.location}&${query}&suppliersList=true`,
      {
        merger,
      },
    );

  const searchCallBack = React.useCallback(
    async function (value: string, router: AppRouterInstance) {
      if (!value) {
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=30&location=${checkout.location}&${query}&q=${value}`,
          {
            next: { revalidate: 0 },
          },
        );
        if (!response.ok) {
          if (response.status === 450) {
            router.replace("/no-service");
            return;
          }
        }
        const result: {
          data: {
            items: Array<{ group: string; items: Array<ProductSummary> }>;
          };
        } = await response.json();
        return result;
      } catch (err) {
        return;
      }
    },
    [checkout.location, query],
  );

  const { onSearchChange, search, results } = useDebouncedSearch<
    | {
        data: { items: Array<{ group: string; items: Array<ProductSummary> }> };
      }
    | undefined
  >(searchCallBack);
  const router = useRouter();
  const cart = useAppSelector(selectCart);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const elementRef = React.useRef<HTMLElement>(null);
  const targetidRef = React.useRef<number>(-1);

  function handleSupplierClick(supplier: string) {
    setSupplier(supplier);
    targetidRef.current = -1;
    onSearchChange("");
  }

  React.useEffect(() => {
    function callback(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (
          entry.target === elementRef.current &&
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.75
        ) {
          const id = elementRef.current.getAttribute("data-id");
          if (!id) {
            return;
          }
          const numId = parseInt(id);
          const shouldCall =
            !search &&
            data?.data?.items &&
            data.data.items.length > 0 &&
            data.data.items[0].currentPage < data.data.items[0].totalPages &&
            targetidRef.current < numId;
          if (shouldCall) {
            targetidRef.current = numId;
            loadMore(
              `${
                process.env.NEXT_PUBLIC_BASE_URL
              }/api/item/getManyItems?limit=20&location=${
                checkout.location
              }&offset=${data.data.items[0].currentPage + 1}&${query}`,
            );
          }
        }
      });
    }

    if (elementRef.current && containerRef.current) {
      const observer = new IntersectionObserver(callback, {
        root: containerRef.current,
        rootMargin: "0px",
        threshold: 0.75,
      });

      const element = elementRef.current;
      observer.observe(element);
      return () => observer.unobserve(element);
    }
  }, [search, data?.data.items, loadMore, checkout.location, query]);

  const products = (results?.data?.items || data?.data?.items)?.filter(
    (record) => record.items.length > 0,
  );

  return error ? (
    <div className="w-full h-[calc(100vh-149px)] !h-[calc(100svh-149px)] flex justify-center items-center -ml-5">
      <div>Something went wrong</div>
    </div>
  ) : (
    <>
      <div
        className={
          data?.data.suppliers && data.data.suppliers.length > 1 ? "" : "mb-4"
        }
      >
        <Searchbar
          placeholder={`Search for ${catName || supplierName} products`}
          value={search}
          onChange={onSearchChange}
        />
      </div>
      {data?.data.suppliers && data.data.suppliers.length > 1 && (
        <div className="flex gap-x-2 flex-nowrap overflow-x-scroll no-scrollbar my-2">
          <span
            key="all"
            className={`px-2.5 py-3.5 ${
              supplier === "all" ? "bg-primary text-on-primary" : "bg-surface"
            } font-medium rounded-[20px] w-14 text-center cursor-pointer`}
            onClick={() => handleSupplierClick("all")}
          >
            All
          </span>
          {data.data.suppliers.map((sup) => (
            <span
              key={sup._id}
              className={`px-2.5 py-3.5  ${
                supplier === sup._id
                  ? "bg-primary text-on-primary"
                  : "bg-surface"
              } font-medium rounded-[20px] cursor-pointer`}
              onClick={() => handleSupplierClick(sup._id)}
            >
              {sup.Supplier_Name}
            </span>
          ))}
        </div>
      )}
      {loading ? (
        <div className="pb-16 mb-4">
          <div
            className={`w-full ${getHeightClasses(
              cart.length,
              data?.data.suppliers,
            )}  flex justify-center items-center`}
          >
            <Loader size={80} />
          </div>
        </div>
      ) : (
        <div className={`-mx-5 mb-4 px-5 ${cart.length > 0 ? "pb-16" : ""}`}>
          {products && products.length > 0 ? (
            <div
              className={`${getHeightClasses(
                cart.length,
                data!.data.suppliers,
              )} overflow-y-auto max-md:no-scrollbar [&>dl>dt:not(:first-child)]:mt-4`}
              ref={containerRef}
            >
              <dl>
                {products.map((product, prodIndex) => (
                  <React.Fragment key={product.group}>
                    <dt className="text-sm font-bold mb-4">{product.group}</dt>
                    <div className="grid gap-y-4 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
                      {product.items.map((item, index) => (
                        <dd
                          key={item._id}
                          className="w-full"
                          ref={
                            prodIndex === 0 &&
                            index === product.items.length - 5
                              ? elementRef
                              : undefined
                          }
                          data-id={index.toString()}
                        >
                          <ProductSummaryComponent
                            data={item}
                            from={from}
                            catName={catName}
                          />
                        </dd>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </dl>
              {subsequentLoading && (
                <div className="w-full flex justify-center">
                  <Loader />
                </div>
              )}
            </div>
          ) : (
            <div
              className={`${
                cart.length > 0
                  ? "h-[calc(100vh-304px)] !h-[calc(100svh-304px)]"
                  : "h-[calc(100vh-240px)] !h-[calc(100svh-240px)]"
              } flex justify-center items-center`}
            >
              <div>No items found in your location</div>
            </div>
          )}
        </div>
      )}
      {cart.length > 0 && (
        <div className="fixed md:absolute bottom-4 left-5 md:left-0 right-5 md:right-0">
          <Snackbar
            message={getAllItemsPrice(cart)}
            actionText={`Go to Cart (${cart.length})`}
            onClick={() => router.push("/checkout")}
          />
        </div>
      )}
    </>
  );
}
