import React from "react";
import RequireLocation from "../RequireLocation";
import CartUpdate from "./cart-update";
import UpdateLocation from "./update-location";
import {
  selectCheckout,
  selectCart,
  AppState,
  setCart,
  setCheckoutDetails as updateCheckoutDetails,
} from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import {
  FlashingState,
  selectFlashingCart,
  setFlashingCart,
} from "@/redux/flashings";

type Props = {
  backOnCompletion?: boolean;
  contained?: boolean;
  followElement?: React.ReactNode;
  onAcceptChanges?: (
    checkout: { location: string },
    cart: Array<
      | { type: "standard"; variant: string; product: string; qty: number }
      | {
          type: "custom";
          variant: string;
          product: string;
          cuttingList: Array<{ qty: number; size: number }>;
        }
    >,
    flashingCart: Array<{
      bends: number;
      girth: number;
      colour: { id: string };
      cuttingList: Array<{ qty: number; size: number; price: number }>;
      tapered: boolean;
    }>,
  ) => void;
  onlySearchbar?: boolean;
};

export default function LocationChange({
  backOnCompletion,
  contained,
  followElement,
  onAcceptChanges,
  onlySearchbar,
}: Props) {
  const details = useAppSelector(selectCheckout);
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const [stage, setStage] = React.useState(1);
  const [checkoutDetails, setCheckoutDetails] =
    React.useState<Omit<typeof details, "date">>(details);
  const [newCart, setNewCart] = React.useState<
    Array<AppState["cart"][0] | undefined>
  >([]);
  const [newFlashingCart, setNewFlashingCart] = React.useState<
    Array<FlashingState["cart"][0] | undefined>
  >([]);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function dismissChanges() {
    setCheckoutDetails(details);
    setNewCart([]);
    setNewFlashingCart([]);
    setStage(1);
    if (backOnCompletion) {
      router.back();
    }
  }

  function acceptChanges() {
    const cleanNewCart = newCart.filter(Boolean) as AppState["cart"];
    const cleanNewFlashingCart = newFlashingCart.filter(
      Boolean,
    ) as FlashingState["cart"];
    dispatch(setCart(cleanNewCart));
    dispatch(setFlashingCart(cleanNewFlashingCart));
    dispatch(
      updateCheckoutDetails({
        location: checkoutDetails.location as string,
        address: checkoutDetails.address,
      }),
    );
    // dispatch(setCheckoutType(checkoutDetails.type));
    setStage(1);
    if (onAcceptChanges) {
      onAcceptChanges(
        checkoutDetails as any,
        cleanNewCart,
        cleanNewFlashingCart,
      );
    }
    if (backOnCompletion) {
      router.back();
    }
  }

  return (
    <RequireLocation>
      {stage === 1 ? (
        <>
          <UpdateLocation
            checkoutDetails={checkoutDetails}
            cart={cart}
            setCheckoutDetails={setCheckoutDetails}
            setStage={setStage}
            setNewCart={setNewCart}
            backOnSuccess={backOnCompletion}
            bottomPadding={!followElement}
            flashingCart={flashingCart}
            setNewFlashingCart={setNewFlashingCart}
            onlySearchbar={onlySearchbar}
          />
          {followElement}
        </>
      ) : (
        <CartUpdate
          cart={cart}
          newCart={newCart}
          onSubmit={acceptChanges}
          onDismiss={dismissChanges}
          contained={contained}
          flashingCart={flashingCart}
          newFlashingCart={newFlashingCart}
        />
      )}
    </RequireLocation>
  );
}
