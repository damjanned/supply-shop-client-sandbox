import React from "react";
import { FlashingState } from "@/redux/flashings";
import { formatPrice, getFlashingPrice } from "@/lib/utils";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";

type Props = {
  flashings: Array<
    Pick<FlashingState["cart"][0], "image" | "cuttingList" | "id"> & {
      colour: { name: string };
    }
  >;
  onEdit?: (index: number) => void;
  shapesCount: number;
  totalPrice: number;
  containerClasses?: string;
  defaultExpanded?: boolean;
  header?: boolean;
};

export default function FlashingAccordion({
  flashings,
  shapesCount,
  totalPrice,
  onEdit,
  containerClasses,
  defaultExpanded,
  header = true,
}: Props) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  React.useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className={`p-4 flex-col ${containerClasses}`}>
      {header && (
        <div
          className="flex justify-between"
          onClick={() => setExpanded((curr) => !curr)}
        >
          <div className="font-semibold">Flashings Order</div>
          <button
            className={`p-2.5 font-semibold rounded-[20px] flex gap-x-1 items-center focus:outline-none ${
              expanded ? "bg-primary text-on-primary" : "bg-surface"
            }`}
          >
            <span>{expanded ? "Hide" : "View"}</span>
            <FaCaretDown className={expanded ? "rotate-180" : ""} />
          </button>
        </div>
      )}
      {expanded && (
        <div className="mt-4 border-y border-y-surface -mx-4">
          {flashings.map((flashing, index) => (
            <div
              key={flashing.id || index.toString()}
              className="flex gap-x-2.5 p-4 border-b border-b-surface"
              onClick={() => {
                if (onEdit) {
                  onEdit(index);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flashing.image}
                alt="Shape"
                className="w-28 h-32 object-contain"
              />
              <div className="grow">
                <div className="text-sm font-semibold">
                  <span>Shape {index + 1}</span>
                  <span className="text-on-surface-variant ml-1">
                    {flashing.colour.name}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium">
                  {flashing.cuttingList.map((record) => (
                    <div key={record.size}>
                      {record.qty} x {record.size}mm
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={` ${
                  onEdit
                    ? "flex flex-col justify-between items-end"
                    : "self-end"
                } font-semibold text-sm`}
              >
                {onEdit && <BiDotsVerticalRounded className="cursor-pointer" />}
                <div>{getFlashingPrice(flashing)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {header && (
        <div
          className={`flex justify-between items-end pt-3 ${
            expanded ? "border-t-2 border-t-surface -mx-4 px-4" : ""
          }`}
        >
          <div className="text-xs font-medium text-on-surface-variant">
            <div>Total Shapes: {flashings.length}</div>
            <div>Total Pieces: {shapesCount}</div>
          </div>
          <div className="text-lg font-semibold text-right leading-5">
            {formatPrice(totalPrice).slice(1)}
          </div>
        </div>
      )}
    </div>
  );
}
