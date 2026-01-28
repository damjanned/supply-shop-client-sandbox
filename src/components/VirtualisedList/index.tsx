import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Loader from "../Loader";

type Props<T> = {
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  data: Array<T>;
  loadNextPage: () => void;
  renderItem: (data: T) => React.ReactNode;
  listProps: {
    itemSize: number;
    height: number;
    width: number | string;
    [key: string]: any;
  };
  numCols?: number;
  listEmptyText?: string;
};

export default function VirtualisedList<T extends Array<any>>({
  hasNextPage,
  isNextPageLoading,
  data,
  loadNextPage,
  renderItem,
  listProps,
  numCols = 1,
  listEmptyText = "No items found in your location",
}: Props<T[0]>) {
  const itemCount = hasNextPage ? data.length + 1 : data.length;
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;
  const isItemLoaded = (index: number) =>
    !hasNextPage || numCols * index < data.length;
  const Row = ({ index, style }: { index: number; style: any }) => {
    let content: React.ReactNode;
    if (!isItemLoaded(index)) {
      content = (
        <div className="w-full flex justify-center items-center">
          <Loader size={10} />
        </div>
      );
    } else {
      const indices = [];
      for (let i = 0; i < numCols; i++) {
        indices.push(numCols * index + i);
      }
      content = (
        <div
          className={`grid gap-x-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}
        >
          {indices.map((ind) =>
            ind < data.length ? renderItem(data[ind]) : null,
          )}
        </div>
      );
    }
    return <div style={style}>{content}</div>;
  };

  return itemCount ? (
    <InfiniteLoader
      itemCount={Math.ceil(itemCount / numCols)}
      loadMoreItems={loadMoreItems}
      isItemLoaded={isItemLoaded}
      threshold={10}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          onItemsRendered={onItemsRendered}
          ref={ref}
          itemCount={Math.ceil(itemCount / numCols)}
          {...listProps}
          innerElementType="ul"
          className="max-md:no-scrollbar"
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  ) : (
    <div
      style={{
        height: listProps.height,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {listEmptyText}
    </div>
  );
}
