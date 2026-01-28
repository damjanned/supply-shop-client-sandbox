"use client";

import useMinWidth from "@/hooks/useMinWidth";
import Searchbar from "@/components/Searchbar";
import useDebouncedSearch from "@/hooks/useDebouncedSearch";
import { addToSearchHistory, selectSearchHistory } from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import React from "react";
import { IoMdArrowDropright } from "react-icons/io";
import Loader from "../Loader";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Props<I, C> = {
  emptyListDetails?: {
    initialData: Array<C>;
    InitialDataComponent: React.JSXElementConstructor<{ data: C }>;
    containerClass?: string;
    customItemHeight?: string;
  };
  searchUrl: string;
  title?: string;
  RowComponent: React.JSXElementConstructor<{ data: I }>;
  autoFocus?: boolean;
  ratio?: number;
  compactContent?: boolean;
  entity?: string;
  persist?: boolean;
  group?: boolean;
  placeholder?: string;
};

export default function SearchableList<
  T extends { items: Array<{ _id: string }>; group: string },
  C extends { _id: string },
>({
  searchUrl,
  title,
  RowComponent,
  emptyListDetails,
  autoFocus,
  ratio,
  compactContent,
  entity = "items",
  persist,
  group,
  placeholder,
}: Props<T["items"][0], C>) {
  const searchCallback = React.useCallback(
    async function search(value: string, router: AppRouterInstance) {
      if (!value) {
        return;
      }
      try {
        const response = await fetch(`${searchUrl}${value}`, {
          next: { revalidate: 0 },
        });
        if (!response.ok) {
          if (response.status === 450) {
            router.replace("/no-service");
            return;
          }
        }
        let json = await response.json();
        const data: Array<T> = json.data.items;
        if (group) {
          return data.filter((record) => record.items.length > 0);
        } else {
          return data[0].items.length > 0 ? [data[0]] : [];
        }
      } catch (err) {
        return;
      }
    },
    [searchUrl, group],
  );
  const { search, results, onSearchChange, loading } = useDebouncedSearch<
    Array<T> | undefined
  >(searchCallback, 300);
  const { isLarger: isTab, viewport: mvw } = useMinWidth(768);
  const { isLarger: isDesktop } = useMinWidth(1024);
  const { isLarger, viewport } = useMinWidth(352);
  const dispatch = useAppDispatch();
  const history = useAppSelector(selectSearchHistory);
  let itemHeight: string;

  if (ratio) {
    if (isDesktop) {
      const itemWidth = 960 / 3;
      itemHeight = (ratio * itemWidth).toFixed(0);
    } else if (isTab) {
      const itemWidth = (mvw - 52) / 2;
      itemHeight = (ratio * itemWidth).toFixed(0);
    } else if (isLarger) {
      const itemWidth = viewport - 40;
      itemHeight = (ratio * itemWidth).toFixed(0);
    }
  }

  return (
    <>
      <div className="mt-2">
        <Searchbar
          fullWidth
          onChange={onSearchChange}
          value={search}
          autoFocus={autoFocus}
          placeholder={placeholder || "Search for products"}
        />
      </div>
      {title && !search && <div className="mt-4 font-bold">{title}</div>}
      {!search ? (
        emptyListDetails ? (
          <ul
            className={`mt-4 grid gap-y-4 gap-x-3 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-md:no-scrollbar
        ${
          compactContent
            ? "max-h-[calc(100%-80px)]"
            : "max-h-[calc(100%-120px)]"
        } ${emptyListDetails.containerClass}
        `}
          >
            {emptyListDetails.initialData.map((value) => (
              <li
                key={value._id}
                className="w-full"
                style={{
                  height:
                    emptyListDetails.customItemHeight || itemHeight
                      ? `${emptyListDetails.customItemHeight || itemHeight}px`
                      : "6.25rem",
                }}
              >
                <emptyListDetails.InitialDataComponent data={value} />
              </li>
            ))}
          </ul>
        ) : persist ? (
          <>
            <div className="text-sm font-bold mt-4">Recent Searches</div>
            <ul>
              {history.map((searchString) => (
                <li
                  key={searchString}
                  className="flex items-center gap-x-3 mt-4"
                  onClick={() => {
                    onSearchChange(searchString);
                  }}
                >
                  <IoMdArrowDropright />
                  <div className="text-sm font-medium cursor-pointer">
                    {searchString}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null
      ) : results && results.length > 0 ? (
        <dl className="mt-4 overflow-y-auto max-md:no-scrollbar [&>dt:not(:first-child)]:mt-4 h-[calc(100%-80px)]">
          {results.map((value) => (
            <React.Fragment key={value.group}>
              <dt className="text-sm font-bold mb-4">{value.group}</dt>
              <div className="grid gap-y-4 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
                {value.items.map((item) => (
                  <dd
                    key={item._id}
                    className="w-full"
                    onClick={() => {
                      if (persist) {
                        dispatch(addToSearchHistory(search));
                      }
                    }}
                  >
                    <RowComponent data={item} />
                  </dd>
                ))}
              </div>
            </React.Fragment>
          ))}
        </dl>
      ) : loading ? (
        <div className="h-[calc(100%-80px)] flex justify-center items-center">
          <Loader size={50} />
        </div>
      ) : (
        <div className="h-[calc(100%-80px)] flex justify-center items-center">
          <div>No {entity} found in your location</div>
        </div>
      )}
    </>
  );
}
