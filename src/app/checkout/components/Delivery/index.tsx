"use client";
import LocationChange from "@/components/LocationChange";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  bulkMergeSupplierCheckouts,
  selectCart,
  selectCheckout,
} from "@/redux/app";
import useMutation from "@/hooks/useMutation";
import { FlashingOrderCart, OrderCart } from "@/types/order-cart";
import Loader from "@/components/Loader";
import { selectFlashingCart } from "@/redux/flashings";
import DeliverySelector from "./delivery-selector";
import Modal from "@/components/Modal";
import { PrimaryButton } from "@/components/Button";

export default function DeliveryDate() {
  const checkout = useAppSelector(selectCheckout);
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const [address, setAddress] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [executor, { error, data }] = useMutation<
    {
      items: OrderCart;
      location: string;
      // delivery: boolean;
      flashings: FlashingOrderCart;
    },
    {
      data: Array<{
        supplierName: string;
        branchName: string;
        items: Array<{ itemId: string }>;
        flashings: Array<{ clientID: string }>;
        supplierId: string;
        availableDates: string[];
        deliveryAvailable: boolean;
        pickupAvailable: boolean;
        pickUpAddress?: string;
        povaPickUp: boolean;
        povaPickUpCharge?: boolean;
        povaPickupAddress?: string;
      }>;
    }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/getSuppliersDeliveryCalendar`,
  });
  const dispatch = useAppDispatch();

  const getDeliveryEstimate = React.useCallback(
    async function (
      checkout: {
        location: string;
        // type: "Delivery" | "Pick-Up";
      },
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
        id: string;
      }>,
    ) {
      const { data } = await executor({
        location: checkout.location as string,
        items: cart.map((item) => {
          if (item.type === "standard") {
            return {
              variant: item.variant,
              item: item.product,
              qty: item.qty,
            };
          } else {
            return {
              variant: item.variant,
              item: item.product,
              cuttingList: item.cuttingList,
            };
          }
        }),
        // delivery: checkout.type === "Delivery",
        flashings: flashingCart.map((record) => ({
          bends: record.bends,
          girth: record.girth,
          id: record.id,
          flashingVariant: record.colour.id,
          cuttingList: record.cuttingList.map((element) => ({
            size: element.size,
            qty: element.qty,
          })),
          tapered: record.tapered,
        })),
      });
      if (data) {
        dispatch(bulkMergeSupplierCheckouts(data.data));
      }
      setLoading(false);
    },
    [executor, dispatch],
  );

  React.useEffect(() => {
    getDeliveryEstimate(checkout as { location: string }, cart, flashingCart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return error ? (
    <div className="w-full h-[calc(100vh-130px)] h-[calc(100svh-130px)] flex justify-center items-center -ml-5">
      <div>Something went wrong</div>
    </div>
  ) : loading ? (
    <div className="w-full h-[calc(100vh-130px)] h-[calc(100svh-130px)] flex justify-center items-center -ml-5">
      <Loader size={100} />
    </div>
  ) : (
    <div className="-mx-5">
      <LocationChange
        contained
        followElement={
          <DeliverySelector
            supplierProducts={data!.data}
            showAddress={setAddress}
          />
        }
        onAcceptChanges={(checkout, cart) => {
          setLoading(true);
          getDeliveryEstimate(checkout, cart, flashingCart);
        }}
        backOnCompletion={false}
        onlySearchbar
      />
      <Modal
        visible={!!address}
        fullWidth
        overlay
        overlayContentFullWidth
        overlayContentPositon="end"
      >
        <div className="mb-2.5">
          <div className="font-semibold">Pick-Up address: </div>
          <div className="text-on-surface-variant">{address}</div>
        </div>
        <PrimaryButton text="Close" fullWidth onClick={() => setAddress("")} />
      </Modal>
    </div>
  );
}
