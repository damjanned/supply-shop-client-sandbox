import AutoComplete from "../Autocomplete";
import { SecondaryButton } from "../Button";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { formatPrice, getItemPrice } from "@/lib/utils";
import React from "react";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Item =
  | {
      variant: string;
      qty: number;
      price: number;
      colour?: string;
      type: "standard";
      name: string;
      itemName: string;
    }
  | {
      variant: string;
      cuttingList: Array<{ qty: number; size: number }>;
      colour?: string;
      type: "custom";
      name: string;
      unit: string;
      itemName: string;
      price: number;
    };

type Props = {
  cart: Array<Item>;
  onEdit?: (index: number) => void;
  onQtyUpdate?: (index: number, newQty: number) => void;
  totalPrice: number;
  containerClasses?: string;
  defaultExpanded?: boolean;
  header?: boolean;
  onEditCuttingList?: (index: number) => void;
};

/**
 * type, cuttingList, qty, variant, itemName, name, colour
 */

export default function ItemsAccordion({
  cart,
  onEdit,
  onQtyUpdate,
  totalPrice,
  containerClasses,
  defaultExpanded = false,
  header = true,
  onEditCuttingList,
}: Props) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const router = useRouter();

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
              {onEdit ? (
                <>
                  <col className="w-3/12" />
                  <col className="w-5/12" />
                  <col className="w-3/12" />
                  <col className="w-1/12" />
                </>
              ) : (
                <>
                  <col className="w-2/12" />
                  <col className="w-6/12" />
                  <col className="w-4/12" />
                </>
              )}
            </colgroup>
            <tbody
              className={`[&_td]:py-4 [&_td]:border-b [&_td]:border-b-surface [&>tr>td:last-child]:pr-4 [&>tr>td:first-child]:pl-4 [&>tr>td:first-child]:pr-[10px]`}
            >
              {cart.map((item, index) => (
                <tr
                  key={item.variant}
                  onClick={() => {
                    if (onEdit) {
                      onEdit(index);
                    }
                  }}
                >
                  <td valign="top">
                    {item.type === "standard" ? (
                      onQtyUpdate ? (
                        <AutoComplete
                          value={item.qty.toString()}
                          onChange={(newQty) => {
                            const qty = parseInt(newQty);
                            if (isNaN(qty) || qty <= 0) {
                              return;
                            }
                            onQtyUpdate(index, qty);
                          }}
                          inputMode="numeric"
                          id={`Item${index.toString()}`}
                          fullWidth
                        />
                      ) : (
                        <span className="inline-block bg-surface py-2 px-4 font-semibold rounded-pova-lg">
                          {item.qty}
                        </span>
                      )
                    ) : null}
                  </td>
                  <td valign="top">
                    <div className="font-semibold">{`${item.itemName} ${item.name}`}</div>
                    <div className="font-medium text-on-surface">
                      {item.colour || "Unpainted"}
                    </div>
                    {item.type === "custom" && (
                      <>
                        <div className="font-medium text-xs mb-1">
                          {item.cuttingList.map((record, index) => (
                            <div key={index.toString()}>
                              {record.qty} x {record.size}
                              {item.unit}
                            </div>
                          ))}
                        </div>
                        {onEdit && (
                          <SecondaryButton
                            text="Edit Cutting List"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditCuttingList) {
                                onEditCuttingList(index);
                              } else {
                                router.push(`/checkout/${index}/edit`);
                              }
                            }}
                            small
                          />
                        )}
                      </>
                    )}
                  </td>
                  <td valign="top" align="right">
                    <div className="font-medium">{getItemPrice(item)}</div>
                  </td>
                  {onEdit && (
                    <td align="right">
                      <BiDotsVerticalRounded className="cursor-pointer" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {header && (
        <div
          className={`flex justify-between items-end pt-3  ${
            expanded ? "border-t border-t-surface -mx-4 px-4" : ""
          }`}
        >
          <div className="text-xs font-medium text-on-surface-variant">
            Total Items: {cart.length}
          </div>
          <div className="text-lg font-semibold text-right leading-5">
            {formatPrice(totalPrice).slice(1)}
          </div>
        </div>
      )}
    </div>
  );
}
