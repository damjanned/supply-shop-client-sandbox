"use client";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { getFlashingPrice } from "@/lib/utils";
import {
  removeFlashingItemFromCart,
  selectFlashingCart,
  setCurrentFlashing,
} from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import React from "react";

export default function FlashingCart() {
  const cart = useAppSelector(selectFlashingCart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function editItem(id: string) {
    const index = cart.findIndex((item) => item.id === id);
    dispatch(
      setCurrentFlashing({
        diagram: cart[index].diagram,
        image: cart[index].image,
        cuttingList: cart[index].cuttingList,
        colour: cart[index].colour.id,
        category: cart[index].category,
        colourDir: cart[index].colourDir,
        tapered: cart[index].tapered,
      }),
    );
    router.push(encodeURI(`/flashings?edit=${id}&editNo=${index}`));
  }

  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)] pt-4 relative">
        <div className="font-bold text-pova-heading">Flashings Order</div>
        <div className="h-[calc(100vh-290px)] h-[calc(100svh-290px)] overflow-y-auto max-md:no-scrollbar">
          {cart.map((item, index) => (
            <div
              key={item.id}
              className="bg-white flex px-3 py-2 rounded-pova-lg justify-between mt-4 cursor-pointer border-2 border-surface"
              onClick={() => editItem(item.id)}
            >
              <div>
                <div className="font-semibold text-sm">
                  Flashing #{index + 1}
                </div>
                <div className="mt-0.5 flex gap-x-2 items-center">
                  <span
                    style={{ backgroundColor: `#${item.colour.code}` }}
                    className="inline-block w-4 h-4 rounded-full"
                  />
                  <span className="font-medium text-xs text-on-surface-variant">
                    {item.colour.name}
                  </span>
                </div>
                <div className="mt-1 font-medium text-xs text-on-surface-variant">
                  Total bends: {item.bends}
                </div>
                <div className="font-medium text-xs text-on-surface-variant">
                  Total Girth: {item.girth}mm
                </div>
                <div
                  className="mt-1 text-[10px] text-error cursor-pointer font-medium"
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeFlashingItemFromCart(item.id));
                  }}
                >
                  Remove
                </div>
              </div>
              <div className="flex flex-col justify-between gap-y-1 items-end">
                <div>
                  {item.cuttingList.map((record, index) => (
                    <div
                      key={index.toString()}
                      className="text-xs font-medium text-on-surface-variant text-right"
                    >
                      {record.qty} x {record.size}mm
                    </div>
                  ))}
                </div>
                <div className="text-lg font-semibold text-right">
                  {getFlashingPrice(item)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed left-0 right-0 bottom-0 md:absolute md:-left-5 md:-right-5 py-4 px-5 shadow-pova-lg">
          <PrimaryButton
            text="Create New Flashing"
            fullWidth
            link="/flashings/library"
          />
          <div className="mt-4">
            <SecondaryButton
              text="Go to Cart"
              fullWidth
              link="/checkout"
              smallestRadius
              containerClasses="!py-4"
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
