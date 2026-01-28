import { SecondaryButton } from "@/components/Button";
import Range from "../../../../../components/Range";
import TextInput from "@/components/TextInput";
import { RiCloseLine } from "react-icons/ri";
import React from "react";
import AutoComplete from "@/components/Autocomplete";
import type { AddOnData, AddOnItem, AddOnRowState } from "../ProductDetails";
import Loader from "@/components/Loader";
import AddOns from "../Addons";

type Props =
  | {
      qty: number;
      onQtyChange: (newQty: number) => void;
      type: "standard";
      colour: string;
      name: string;
      loading: boolean;
      data?: Array<AddOnItem>;
      rowStates: Array<AddOnRowState>;
      setRowStates: React.Dispatch<React.SetStateAction<AddOnRowState[]>>;
      addOns: Array<AddOnData>;
      addAddOn: (addOn: AddOnData) => void;
      updateAddOn: (updatedAddOn: AddOnData, index: number) => void;
      removeAddOn: (index: number) => void;
    }
  | {
      cuttingList: Array<{ qty: number; size: number }>;
      stockLengths?: Array<{ size: number; price: number }>;
      addItem: () => void;
      updateItem: (
        index: number,
        updated: { qty: number; size: number },
      ) => void;
      unit: string;
      price: number;
      type: "custom";
      cuttingErrors: { [key: number]: boolean };
      removeError: (index: number) => void;
      errorMessage: string;
      colour: string;
      name: string;
      loading: boolean;
      data?: Array<AddOnItem>;
      rowStates: Array<AddOnRowState>;
      setRowStates: React.Dispatch<React.SetStateAction<AddOnRowState[]>>;
      addOns: Array<AddOnData>;
      addAddOn: (addOn: AddOnData) => void;
      updateAddOn: (updatedAddOn: AddOnData, index: number) => void;
      removeAddOn: (index: number) => void;
    };

export default function QuantitySelector(props: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  function changeItemQty(index: number, newQty: number) {
    if (props.type === "custom") {
      props.updateItem(index, { ...props.cuttingList[index], qty: newQty });
    }
  }
  function changeItemSize(index: number, newSize: string) {
    const size = parseFloat(newSize);
    if (isNaN(size) && newSize !== "") {
      return;
    }
    if (props.type === "custom") {
      props.updateItem(index, {
        ...props.cuttingList[index],
        size: isNaN(size) ? 0 : size,
      });
      props.removeError(index);
    }
  }

  return (
    <>
      <div className="px-5">
        <div className="font-bold -mx-5 px-5 py-4 border-b-2 border-b-surface">
          <div className="text-xl truncate">{props.name}</div>
          <div className="mt-2.5 text-on-surface h-6">{props.colour}</div>
        </div>
        {props.type === "standard" ? (
          <>
            <div>
              <div className="my-4 font-bold text-xl">Quantity</div>
              <AutoComplete
                value={props.qty.toString()}
                onChange={(newQty) => {
                  const qty = parseInt(newQty);
                  if (isNaN(qty) || qty <= 0) {
                    return;
                  }
                  props.onQtyChange(qty);
                }}
                id="quantity-selector"
                inputMode="numeric"
                buttonClassName="px-4"
              />
            </div>
          </>
        ) : (
          <>
            {Object.keys(props.cuttingErrors).length > 0 && (
              <div className="mt-4 text-on-error">{props.errorMessage}</div>
            )}
            <div
              className="-mx-5 px-5 max-h-[calc(100vh-467px)] !max-h-[calc(100svh-467px)] overflow-y-auto max-md:no-scrollbar pb-16"
              ref={containerRef}
            >
              <table className={`w-full border-collapse table-fixed `}>
                <colgroup>
                  <col className="w-4/12" />
                  <col className="w-1/12" />
                  <col className="w-4/12" />
                  <col className="w-3/12" />
                </colgroup>
                <thead
                  className={`sticky bg-white top-0 ${
                    Object.keys(props.cuttingErrors).length > 0
                      ? "[&_th]:pt-2"
                      : "[&_th]:pt-4"
                  } [&_th]:pb-2`}
                >
                  <tr className="[&>th]:font-bold [&>th]:text-2xl">
                    <th align="left">Quantity</th>
                    <th></th>
                    <th align="left">Size</th>
                    <th align="left">Total</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)>td]:pb-4">
                  {props.cuttingList.map((item, index) => {
                    const stockSize =
                      props.stockLengths &&
                      props.stockLengths.length > 0 &&
                      item.size > 0 &&
                      props.stockLengths.find(
                        (record, index) =>
                          record.size >= item.size ||
                          index === props.stockLengths!.length - 1,
                      );
                    const divisionFactor =
                      props.unit === "MM"
                        ? 1000
                        : props.unit === "CM"
                        ? 100
                        : 1;
                    return (
                      <React.Fragment key={index.toString()}>
                        <tr className={stockSize ? "[&>td]:!pb-2" : ""}>
                          <td align="left" valign="middle">
                            <div className="max-w-32">
                              <Range
                                value={item.qty}
                                onChange={(newQty: number) =>
                                  changeItemQty(index, newQty)
                                }
                                noValidate
                                fullWidth
                              />
                            </div>
                          </td>
                          <td valign="middle">
                            <RiCloseLine className="text-on-surface-variant" />
                          </td>
                          <td align="left" valign="middle">
                            <TextInput
                              value={item.size > 0 ? item.size.toString() : ""}
                              onChange={(newSize) =>
                                changeItemSize(index, newSize)
                              }
                              placeholder={props.unit}
                              rootClasses={`w-[90px] max-w-[90px] ${
                                props.cuttingErrors[index]
                                  ? "outline outline-on-error"
                                  : ""
                              }`}
                              inputMode="numeric"
                            />
                          </td>
                          <td align="left" valign="middle">
                            <div className="font-medium text-on-surface">
                              $
                              {stockSize
                                ? (item.qty * stockSize.price).toFixed(2)
                                : (
                                    (item.qty * item.size * props.price) /
                                    divisionFactor
                                  ).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                        {stockSize && (
                          <tr>
                            <td />
                            <td />
                            <td colSpan={2}>
                              <span className="text-[10px] sm:text-xs">
                                Stock Length: ${stockSize.price.toFixed(2)} p/
                                {stockSize.size}
                                {props.unit}
                              </span>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <SecondaryButton
                text="Add New Size"
                onClick={() => {
                  props.addItem();
                  setTimeout(() => {
                    containerRef?.current?.scrollBy({
                      top: 150,
                    });
                  }, 0);
                }}
              />
            </div>
          </>
        )}
      </div>
      {props.loading ? (
        <div className="flex justify-center pt-12">
          <Loader size={30} />
        </div>
      ) : props.data && props.data.length > 0 ? (
        <>
          <div className="border-t-surface border-t-[7px] mt-4 py-4 text-xl font-bold border-b-surface border-b-[3px] px-5">
            Accessories (optional)
          </div>
          <AddOns
            rowStates={props.rowStates}
            setRowStates={props.setRowStates}
            data={props.data!}
            addOns={props.addOns}
            addAddOn={props.addAddOn}
            updateAddOn={props.updateAddOn}
            removeAddOn={props.removeAddOn}
          />
        </>
      ) : null}
    </>
  );
}
