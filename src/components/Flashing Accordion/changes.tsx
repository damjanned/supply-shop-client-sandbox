import React from "react";
import { FlashingState } from "@/redux/flashings";
import { getFlashingPrice } from "@/lib/utils";
import { FaCaretDown } from "react-icons/fa";

type Props = {
  flashings: FlashingState["cart"];
  newFlashings: Array<FlashingState["cart"][0] | undefined>;
  changeIndexes: number[];
  containerClasses?: string;
  defaultExpanded?: boolean;
  header?: boolean;
};

export default function FlashingChangesAccordion({
  flashings,
  containerClasses,
  newFlashings,
  changeIndexes,
  defaultExpanded = false,
  header = true,
}: Props) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

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
          {changeIndexes.map((cIndex) => {
            const newFlashing = newFlashings[cIndex];
            const oldFLashing = flashings[cIndex];
            return (
              <div
                key={oldFLashing.id}
                className="flex gap-x-2.5 p-4 border-b border-b-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={oldFLashing.image}
                  alt="Shape"
                  className="w-28 h-32 object-contain"
                />
                <div className="grow">
                  <div className="text-sm font-semibold">
                    <span>Shape {cIndex + 1}</span>
                    <span className="text-on-surface-variant ml-1">
                      {oldFLashing.colour.name}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium">
                    {oldFLashing.cuttingList.map((record) => (
                      <div key={record.size}>
                        {record.qty} x {record.size}mm
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  {newFlashing === undefined ? (
                    <div className="font-medium text-error">
                      Item Unavailable
                    </div>
                  ) : (
                    <>
                      <div className="text-on-surface line-through">
                        {getFlashingPrice(oldFLashing)}
                      </div>
                      <div>{getFlashingPrice(newFlashing)}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {header && (
        <div
          className={`text-right pt-3 font-semibold ${
            expanded ? "border-t-2 border-t-surface -mx-4 px-4" : ""
          }`}
        >
          {changeIndexes.length}{" "}
          {changeIndexes.length === 1 ? "change" : "changes"}
        </div>
      )}
    </div>
  );
}
