import { AppState } from "@/redux/app";
import { getItemPrice } from "@/lib/utils";
import React from "react";
import { FaCaretDown } from "react-icons/fa";

type Props = {
  cart: AppState["cart"];
  newCart: Array<AppState["cart"][0] | undefined>;
  containerClasses?: string;
  changeIndexes: number[];
  defaultExpanded?: boolean;
  header?: boolean;
};

export default function ItemsAccordion({
  cart,
  containerClasses,
  newCart,
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
          <div className="font-semibold">Items Order</div>
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
          <table className="table-fixed w-full">
            <colgroup>
              <col className="w-2/12" />
              <col className="w-6/12" />
              <col className="w-4/12" />
            </colgroup>
            <tbody
              className={`[&_td]:py-4 [&_td]:border-b [&_td]:border-b-surface [&>tr>td:last-child]:pr-4 [&>tr>td:first-child]:pl-4 [&>tr>td:first-child]:pr-[10px]`}
            >
              {changeIndexes.map((cIndex, index) => {
                const item = cart[cIndex];
                const newItem = newCart[cIndex];
                return (
                  <tr key={item.variant}>
                    <td valign="top">
                      {item.type === "standard" && (
                        <span className="inline-block bg-surface py-2 px-4 font-semibold rounded-pova-lg">
                          {item.qty}
                        </span>
                      )}
                    </td>
                    <td valign="top">
                      <div className="font-semibold">{`${item.itemName} ${item.name}`}</div>
                      <div className="font-medium text-on-surface h-6">
                        {item.colour || ""}
                      </div>
                      {item.type === "custom" && (
                        <div className="font-medium text-xs mb-1">
                          {item.cuttingList.map((record, index) => (
                            <div key={index.toString()}>
                              {record.qty} x {record.size}
                              {item.unit}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td valign="top" align="right">
                      {newItem === undefined ? (
                        <div className="font-medium text-error">
                          Item Unavailable
                        </div>
                      ) : (
                        <>
                          <div className="text-on-surface line-through">
                            {getItemPrice(item)}
                          </div>
                          <div className="text-on-surface">
                            {getItemPrice(newItem)}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {header && (
        <div
          className={`text-right pt-3 font-semibold ${
            expanded ? "border-t-2 border-t-surface -mx-4 px-4" : ""
          }`}
        >
          {changeIndexes.length} changes
        </div>
      )}
    </div>
  );
}
