import React from "react";
import type { Fence } from ".";
import { FencingDetailResponse, GateDetailResponse } from "@/types/fencing";
import { getItems } from "../utils";
import { getAllItemsPrice } from "@/lib/utils";
import Snackbar from "@/components/Snackbar";
import { useAppDispatch } from "@/redux/hooks";
import { addItemToCart, AppState } from "@/redux/app";
import Modal from "@/components/Modal";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { useRouter } from "next/navigation";
import { MdArrowLeft } from "react-icons/md";
import ItemsAccordion from "@/components/ItemsAccordion/details";
import TextInput from "@/components/TextInput";
import { RiCloseLine } from "react-icons/ri";
import Range from "@/components/Range";

type Props = {
  fence: Fence;
  data: FencingDetailResponse;
  setShowItems: React.Dispatch<React.SetStateAction<boolean>>;
  gateDetails: { [key: string]: GateDetailResponse };
};

export default function Items({
  fence,
  data,
  setShowItems,
  gateDetails,
}: Props) {
  const [editIndex, setEditIndex] = React.useState(-1);
  const [items, setItems] = React.useState<AppState["cart"]>(
    getItems(data, fence, gateDetails),
  );
  const [cuttingListIndex, setCuttingListIndex] = React.useState(-1);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function onEdit(index: number) {
    setEditIndex(index);
  }

  function onQtyUpdate(index: number, qty: number) {
    setItems((curr) => [
      ...curr.slice(0, index),
      { ...curr[index], qty },
      ...curr.slice(index + 1),
    ]);
  }

  function addToCart() {
    for (const item of items) {
      dispatch(addItemToCart(item));
    }
    router.push("/checkout");
  }

  return cuttingListIndex >= 0 ? (
    <CuttingList
      cartItem={items.length > cuttingListIndex ? items[cuttingListIndex] : {}}
      removeItem={() => {
        setItems((curr) => [
          ...curr.slice(0, cuttingListIndex),
          ...curr.slice(cuttingListIndex + 1),
        ]);
        setCuttingListIndex(-1);
      }}
      updateCuttingList={(cuttingList) => {
        setItems((curr) => [
          ...curr.slice(0, cuttingListIndex),
          { ...curr[cuttingListIndex], cuttingList },
          ...curr.slice(cuttingListIndex + 1),
        ]);
        setCuttingListIndex(-1);
      }}
    />
  ) : (
    <>
      <div className="flex items-center gap-x-3 px-4 pt-4">
        <button
          className="h-12 w-12 rounded-full bg-surface flex justify-center items-center text-2xl focus:outline-none"
          onClick={() => setShowItems(false)}
        >
          <MdArrowLeft />
        </button>
        <div className="font-bold text-pova-heading">Items</div>
      </div>
      <div className="h-[calc(100%-164px)] overflow-y-auto max-md:no-scrollbar [&>div]:pt-0">
        <ItemsAccordion
          cart={items}
          totalPrice={0}
          header={false}
          defaultExpanded
          onQtyUpdate={onQtyUpdate}
          onEdit={onEdit}
          onEditCuttingList={setCuttingListIndex}
        />
      </div>
      {items.length > 0 && (
        <div className="fixed left-0 w-full bottom-0 bg-on-primary shadow-[0_-4px_16px_rgba(0,0,0,0.12)] px-4 py-4 md:left-1/2 md:-translate-x-1/2 max-w-screen-lg">
          <Snackbar
            message={getAllItemsPrice(items)}
            actionText="Add to Cart"
            onClick={addToCart}
            fullWidth
          />
        </div>
      )}
      <Modal
        fullWidth
        overlay
        visible={editIndex >= 0}
        overlayContentPositon="end"
        overlayContentFullWidth
        onClose={() => setEditIndex(-1)}
      >
        <div>
          <div className="font-semibold">
            {editIndex >= 0 ? items[editIndex].itemName : ""}{" "}
            {editIndex >= 0 ? items[editIndex].name : ""}
          </div>
          <div className="font-medium text-on-surface mb-4 h-6">
            {editIndex >= 0 ? items[editIndex].colour : ""}
          </div>
          <PrimaryButton
            text="Remove Item"
            fullWidth
            onClick={() => {
              setItems((curr) => [
                ...curr.slice(0, editIndex),
                ...curr.slice(editIndex + 1),
              ]);
              setEditIndex(-1);
            }}
          />
        </div>
      </Modal>
    </>
  );
}

function CuttingList({
  cartItem,
  removeItem,
  updateCuttingList,
}: {
  cartItem: any;
  removeItem: () => void;
  updateCuttingList: (list: Array<{ size: number; qty: number }>) => void;
}) {
  const [cutting, setCutting] = React.useState<
    Array<{ size: number; qty: number }>
  >(cartItem?.cuttingList || []);
  const [cuttingErrors, setCuttingErrors] = React.useState<{
    [key: number]: boolean;
  }>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

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
      updateCuttingList(
        cutting[cutting.length - 1].size === 0
          ? cutting.slice(0, cutting.length - 1)
          : cutting,
      );
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
    <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)] px-5">
      <div className="font-bold py-4 border-b-2 border-b-surface">
        <div className="text-xl truncate">
          {cartItem?.itemName}&nbsp;{cartItem?.name}
        </div>
        <div className="mt-2.5 text-on-surface h-6">
          {cartItem.colour || ""}
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
            {cutting.map((item, index) => (
              <tr key={index.toString()}>
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
                      cuttingErrors[index] ? "outline outline-on-error" : ""
                    }`}
                    inputMode="numeric"
                  />
                </td>
                <td align="left" valign="middle">
                  <div className="font-medium text-on-surface">
                    $
                    {(
                      (item.qty * item.size * cartItem?.price) /
                      (cartItem?.unit === "MM"
                        ? 1000
                        : cartItem?.unit === "CM"
                        ? 100
                        : 1)
                    ).toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
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
  );
}
