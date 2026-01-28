"use client";
import { AppState } from "@/redux/app";
import { PrimaryButton, SecondaryButton } from "../Button";
import { getFlashingPrice } from "@/lib/utils";
import { FlashingState } from "@/redux/flashings";
import FlashingChangesAccordion from "../Flashing Accordion/changes";
import { ItemsChangesAccordion } from "../ItemsAccordion";

type Props = {
  cart: AppState["cart"];
  newCart: Array<AppState["cart"][0] | undefined>;
  flashingCart: FlashingState["cart"];
  newFlashingCart: Array<FlashingState["cart"][0] | undefined>;
  onDismiss: () => void;
  onSubmit: () => void;
  contained?: boolean;
};

export default function CartUpdate({
  cart,
  newCart,
  onSubmit,
  onDismiss,
  contained,
  flashingCart,
  newFlashingCart,
}: Props) {
  const changesIndexes = newCart.reduce<number[]>((acc, curr, index) => {
    if (curr === undefined) {
      return [...acc, index];
    } else if (curr.type === "custom" && curr.stockLengths?.length) {
      const item = cart[index] as any;
      const prevItemPrice = item.cuttingList.reduce(
        (_acc: number, _curr: { size: number; qty: number }) => {
          const cuttingStockLength = item.stockLengths!.find(
            (length: { size: number }) => length.size >= _curr.size,
          );
          const currPrice = cuttingStockLength!.price * _curr.qty;
          return _acc + currPrice;
        },
        0,
      );
      const newPrice = curr.cuttingList.reduce(
        (_acc: number, _curr: { size: number; qty: number }) => {
          const cuttingStockLength = item.stockLengths!.find(
            (length: { size: number }) => length.size >= _curr.size,
          );
          const currPrice = cuttingStockLength!.price * _curr.qty;
          return _acc + currPrice;
        },
        0,
      );
      const parsedPrevPrice = parseFloat(prevItemPrice.toFixed(2));
      const parsedNewPrice = parseFloat(newPrice.toFixed(2));
      if (parsedNewPrice !== parsedPrevPrice) {
        return [...acc, index];
      }
    } else if (curr.price !== cart[index].price) {
      return [...acc, index];
    }
    return acc;
  }, []);

  const flashingChangeIndexes = newFlashingCart.reduce<number[]>(
    (acc, curr, index) => {
      if (curr === undefined) {
        acc.push(index);
      } else {
        const prevPrice = getFlashingPrice(flashingCart[index]);
        const nowPrice = getFlashingPrice(curr);
        if (prevPrice !== nowPrice) {
          acc.push(index);
        }
      }
      return acc;
    },
    [],
  );

  const single = !!(
    (changesIndexes.length > 0 ? 1 : 0) ^
    (flashingChangeIndexes.length > 0 ? 1 : 0)
  );

  return (
    <div
      className={`${
        contained
          ? "h-[calc(100vh-125px)] !h-[calc(100svh-125px)] pb-[141px]"
          : "h-[calc(100vh-61px)] !h-[calc(100svh-61px)] pt-4 pb-[141px]"
      }`}
    >
      <div className="text-pova-heading font-bold">
        Changes ({changesIndexes.length + flashingChangeIndexes.length})
      </div>
      <div className="text-sm font-light mt-4">
        By changing your <span className="font-medium"> Delivery/Pick-up </span>
        location some of the items you have selected may have changed their
        availability status.
      </div>
      <div className="overflow-y-auto max-md:no-scrollbar max-h-[calc(100%-152px)] -mx-5">
        {flashingChangeIndexes.length > 0 && (
          <div className={!single ? "border-b-[3px] border-b-surface" : ""}>
            <FlashingChangesAccordion
              flashings={flashingCart}
              newFlashings={newFlashingCart}
              changeIndexes={flashingChangeIndexes}
              containerClasses="px-5"
              defaultExpanded
              header={!single}
            />
          </div>
        )}
        {changesIndexes.length > 0 && (
          <div className={!single ? "border-b-[3px] border-b-surface" : ""}>
            <ItemsChangesAccordion
              cart={cart}
              newCart={newCart}
              changeIndexes={changesIndexes}
              containerClasses="px-5"
              defaultExpanded
              header={!single}
            />
          </div>
        )}
      </div>
      <div className="fixed md:absolute bottom-0 left-5 right-5 md:left-0 md:right-0 px-5 h-[125px] bg-white z-50">
        <PrimaryButton text="Save Changes" onClick={onSubmit} fullWidth />
        <div className="mt-4">
          <SecondaryButton
            text="Dismiss"
            fullWidth
            onClick={onDismiss}
            smallestRadius
          />
        </div>
      </div>
    </div>
  );
}
