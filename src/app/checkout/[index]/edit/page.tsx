"use client";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { removeFromCart, selectCart, updateCuttingList } from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import Range from "@/components/Range";
import { RiCloseLine } from "react-icons/ri";
import TextInput from "@/components/TextInput";

export default function EditCuttingList() {
  const params = useParams();
  const cart = useAppSelector(selectCart);
  const cartItem = cart[parseInt(params.index as string)] as any;
  const [cutting, setCutting] = React.useState<
    Array<{ size: number; qty: number }>
  >(cartItem?.cuttingList || []);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [cuttingErrors, setCuttingErrors] = React.useState<{
    [key: number]: boolean;
  }>({});
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  function removeError(index: number) {
    setCuttingErrors((curr) => {
      const newErrors = { ...curr };
      delete newErrors[index];
      return newErrors;
    });
  }

  function changeItemQty(index: number, newQty: number) {
    setCutting((curr) => {
      const newList = [...curr.slice(0, index)];
      if (newQty > 0) {
        newList.push({ size: curr[index].size, qty: newQty });
      }
      newList.push(...curr.slice(index + 1));
      return newList;
    });
  }

  function changeItemSize(index: number, newSize: string) {
    const size = parseInt(newSize);
    if (isNaN(size) && newSize !== "") {
      return;
    }
    setCutting((curr) => [
      ...curr.slice(0, index),
      { ...curr[index], size: isNaN(size) ? 0 : size },
      ...curr.slice(index + 1),
    ]);
    removeError(index);
  }

  function removeItem() {
    router.back();
    dispatch(removeFromCart(parseInt(params.index as string)));
  }

  function done() {
    if (cutting.length === 0) {
      removeItem();
    } else {
      const last = cutting[cutting.length - 1];
      const list = [...cutting];
      if (last.size === 0) {
        list.splice(list.length - 1, 1);
      }
      const errors = list.reduce<Array<number>>((acc, curr, index) => {
        if (
          curr.size > (cartItem?.maxSize as number) ||
          curr.size < (cartItem?.minSize as number)
        ) {
          acc.push(index);
        }
        return acc;
      }, []);
      if (list.length === 0) {
        errors.push(0);
      }
      if (errors.length > 0) {
        const errorIndexes: { [key: number]: boolean } = {};
        errors.forEach((index) => {
          errorIndexes[index] = true;
        });
        setCuttingErrors(errorIndexes);
        return;
      }
      dispatch(
        updateCuttingList({
          index: parseInt(params.index as string),
          newList:
            cutting[cutting.length - 1].size === 0
              ? cutting.slice(0, cutting.length - 1)
              : cutting,
        }),
      );
      router.back();
    }
  }

  function addSize() {
    setCutting((curr) => [...curr, { qty: 1, size: 0 }]);
    setTimeout(() => {
      containerRef?.current?.scrollBy({
        top: 150,
      });
    }, 0);
  }

  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        <div className="font-bold py-4 border-b-2 border-b-surface">
          <div className="text-xl truncate">
            {cartItem?.itemName}&nbsp;{cartItem?.name}
          </div>
          <div className="mt-2.5 text-on-surface h-6">
            {cartItem?.colour || ""}
          </div>
        </div>
        <div
          className="max-h-[calc(100vh-373px)] !max-h-[calc(100svh-373px)] overflow-y-auto max-md:no-scrollbar pb-16"
          ref={containerRef}
        >
          {Object.keys(cuttingErrors).length > 0 && (
            <div className="mt-4 text-on-error">
              Size should be between {cartItem?.minSize} and {cartItem?.maxSize}
            </div>
          )}
          <table
            className={`w-full border-collapse table-fixed ${
              Object.keys(cuttingErrors).length > 0 ? "mt-2" : "mt-4"
            }`}
          >
            <colgroup>
              <col className="w-4/12" />
              <col className="w-1/12" />
              <col className="w-4/12" />
              <col className="w-3/12" />
            </colgroup>
            <thead className="sticky top-0 bg-white">
              <tr className="[&>th]:font-bold [&>th]:text-2xl [&>th]:pb-2">
                <th align="left">Quantity</th>
                <th></th>
                <th align="left">Size</th>
                <th align="left">Total</th>
              </tr>
            </thead>
            <tbody className="[&>tr:not(:last-child)>td]:pb-4">
              {cutting.map((item, index) => {
                const stockSize =
                  cartItem?.stockLengths &&
                  cartItem.stockLengths.length > 0 &&
                  item.size > 0 &&
                  cartItem?.stockLengths?.find(
                    (record: { size: number; price: number }, index: number) =>
                      record.size >= item.size ||
                      index === cartItem.stockLengths!.length - 1,
                  );
                const divisionFactor =
                  cartItem?.unit === "MM"
                    ? 1000
                    : cartItem?.unit === "CM"
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
                          onChange={(newSize) => changeItemSize(index, newSize)}
                          placeholder={cartItem?.unit}
                          rootClasses={`w-[90px] max-w-[90px] ${
                            cuttingErrors[index]
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
                                (item.qty * item.size * cartItem?.price) /
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
                            {cartItem?.unit}
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
          <SecondaryButton text="Add New Size" onClick={addSize} />
        </div>
        <div className="fixed left-5 right-5 bottom-0 md:absolute md:left-0 md:right-0">
          <PrimaryButton text="Done" fullWidth onClick={done} />
          <div className="my-4">
            <SecondaryButton
              text="Remove Item"
              fullWidth
              smallestRadius
              onClick={removeItem}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
