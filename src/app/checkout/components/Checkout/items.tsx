"use client";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { FlashingsDetailsAccordion as FlashingAccordion } from "@/components/Flashing Accordion";
import { ItemsDetailsAccordion as ItemsAccordion } from "@/components/ItemsAccordion";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import useMutation from "@/hooks/useMutation";
import {
  compareCarts,
  comparedFlashingCarts,
  formatPrice,
  getAllFlashingsPriceAndShapes,
  getAllItemsPrice,
} from "@/lib/utils";
import {
  resetSupplierCheckouts,
  selectCart,
  selectCheckout,
  selectJobRef,
  selectSupplierCheckouts,
  selectToken,
  setCart,
  setJobRef,
  setOrderId,
} from "@/redux/app";
import { selectFlashingCart, setFlashingCart } from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  FlashingOrderCart,
  FlashingOrderCartResponse,
  OrderCart,
  OrderCartResponse,
  FlashingOrder,
} from "@/types/order-cart";
import React from "react";
import { FaTruckMoving } from "react-icons/fa6";
import Lottie from "lottie-react";
import deliveryAnimation from "../../../../../public/delivery.json";
import type { DeliveryDetail } from ".";
import { useRouter } from "next/navigation";

type Props = {
  setStage: React.Dispatch<React.SetStateAction<number>>;
  deliveryCharges: number;
  setDeliveryDetails: React.Dispatch<
    React.SetStateAction<Array<DeliveryDetail>>
  >;
  setCreditLimit: React.Dispatch<
    React.SetStateAction<{
      total: number;
      available: number;
    }>
  >;
  detailsExist: boolean;
};

export default function Items({
  setStage,
  deliveryCharges,
  setDeliveryDetails,
  setCreditLimit,
  detailsExist,
}: Props) {
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const jobRef = useAppSelector(selectJobRef);
  const checkout = useAppSelector(selectCheckout);
  const supplierDeliveries = useAppSelector(selectSupplierCheckouts);
  const [loading, setLoading] = React.useState(true);
  const token = useAppSelector(selectToken);

  const router = useRouter();

  const [executor, { error, data }] = useMutation<
    {
      items: OrderCart;
      location: string;
      flashings: FlashingOrderCart;
    },
    {
      data: {
        items: OrderCartResponse;
        flashings: FlashingOrderCartResponse;
        CreditLimitStatus: boolean;
        Credit_Limit_Amount: number;
        Credit_Limit_Available_Amount: number;
      };
    }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/verifyCartItemsAuth`,
    token,
  });
  const [deliveryExecutor, { error: deliveryError, loading: deliveryLoading }] =
    useMutation<
      {
        items: OrderCartResponse;
        flashings: FlashingOrderCartResponse;
        supplierCheckouts: typeof supplierDeliveries;
      },
      {
        data: Array<{
          Supplier_Name: string;
          Supplier_ID: string;
          deliveryCost: number;
          reasoning: string[];
          items: string[];
          flashings: string[];
        }>;
      }
    >({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/delivery/calculate`,
      token,
    });

  const [paymentExecutor, { loading: paymentLoading }] = useMutation<
    {
      items: OrderCart;
      location: string;
      address: string;
      supplierCheckouts: Array<{
        supplierId: string;
        type: "Delivery" | "Pick-Up" | "Pova-Pickup";
        date: string;
      }>;
      flashings: FlashingOrder;
      paymentType: "Draft";
      Order_Job_Reference?: string;
    },
    { data: { order: { _id: string } } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/create`,
    token,
  });

  const dispatch = useAppDispatch();

  const [shapes, fCost] = getAllFlashingsPriceAndShapes(flashingCart, false);
  const itemsCost = getAllItemsPrice(cart, false);
  const single = !!(
    (cart.length > 0 ? 1 : 0) ^ (flashingCart.length > 0 ? 1 : 0)
  );

  React.useEffect(() => {
    async function getPrices() {
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
        flashings: flashingCart.map((flashing) => ({
          bends: flashing.bends,
          girth: flashing.girth,
          id: flashing.id,
          flashingVariant: flashing.colour.id,
          tapered: flashing.tapered,
          cuttingList: flashing.cuttingList.map((record) => ({
            size: record.size,
            qty: record.qty,
          })),
        })),
      });
      if (data) {
        const items = data.data.items;
        const flashings = data.data.flashings;
        if (!detailsExist) {
          getDeliveryDetails(items, flashings);
        }
        const [_, newCart] = compareCarts(cart, items);
        const [__, newFlashingCart] = comparedFlashingCarts(
          flashingCart,
          flashings,
        );
        dispatch(setCart(newCart.filter(Boolean) as any));
        dispatch(setFlashingCart(newFlashingCart.filter(Boolean) as any));
        // setDeliveryCharges(data.data.deliveryPrice);
        if (data.data.CreditLimitStatus) {
          setCreditLimit({
            total: data.data.Credit_Limit_Amount,
            available: data.data.Credit_Limit_Available_Amount,
          });
        }
      }
      setLoading(false);
    }
    async function getDeliveryDetails(
      items: OrderCartResponse,
      flashings: FlashingOrderCartResponse,
    ) {
      const { data } = await deliveryExecutor({
        items,
        flashings,
        supplierCheckouts: supplierDeliveries,
      });
      if (data?.data) {
        setDeliveryDetails(
          data.data.map((record) => ({
            supplierId: record.Supplier_ID,
            supplierName: record.Supplier_Name,
            cost: record.deliveryCost || 0,
            reasoning: record.reasoning,
            items: record.items,
            flashings: record.flashings,
          })),
        );
      }
    }
    getPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createDraft() {
    const { error, data: response } = await paymentExecutor({
      items: cart.map((element) => {
        if (element.type === "standard") {
          return {
            item: element.product,
            variant: element.variant,
            qty: element.qty,
          };
        } else {
          return {
            item: element.product,
            variant: element.variant,
            cuttingList: element.cuttingList.map((record) => ({
              ...record,
              size: record.size,
            })),
          };
        }
      }),
      location: checkout.location as string,
      address: checkout.address as string,
      flashings: flashingCart.map((flashing) => ({
        flashingVariant: flashing.colour.id,
        cuttingList: flashing.cuttingList.map((record) => ({
          size: record.size,
          qty: record.qty,
        })),
        bends: flashing.bends,
        girth: flashing.girth,
        tapered: flashing.tapered,
        diagram: JSON.stringify({
          direction: flashing.colourDir,
          data: JSON.parse(flashing.diagram),
          tapered: flashing.tapered,
        }),
        image: flashing.image,
        id: flashing.id,
      })),
      paymentType: "Draft",
      supplierCheckouts: supplierDeliveries,
      Order_Job_Reference: jobRef,
    });
    if (error) {
      const errorMessage = error.message || "Something went wrong";
      alert(errorMessage);
    } else {
      dispatch(setCart([]));
      dispatch(setFlashingCart([]));
      dispatch(setOrderId(response!.data.order._id));
      dispatch(resetSupplierCheckouts());
      dispatch(setJobRef(undefined));
      router.replace(`/order/${response!.data.order._id}/payment?next=success`);
    }
  }

  return error || deliveryError ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -ml-5">
      <div>Something went wrong</div>
    </div>
  ) : loading ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -ml-5">
      <Loader size={100} />
    </div>
  ) : (
    <div className="h-[calc(100vh-125px)] !h-[calc(100svh-125px)] relative pt-3">
      {jobRef ? (
        <div className="text-xl font-bold h-[60px]">{jobRef}</div>
      ) : (
        <div className="text-pova-heading font-bold">Order Summary</div>
      )}
      <div
        className={`${
          deliveryCharges > 0
            ? "h-[calc(100vh-449px)] !h-[calc(100svh-449px)]"
            : "h-[calc(100vh-392px)] !h-[calc(100svh-392px)]"
        } overflow-y-auto max-md:no-scrollbar pb-16 -mx-5`}
      >
        {flashingCart.length > 0 && (
          <div className={!single ? "border-b-[3px] border-b-surface" : ""}>
            <FlashingAccordion
              flashings={flashingCart}
              shapesCount={shapes}
              totalPrice={fCost}
              containerClasses="px-5"
              defaultExpanded
              header={!single}
            />
          </div>
        )}
        {cart.length > 0 && (
          <div className={!single ? "border-b-[3px] border-b-surface" : ""}>
            <ItemsAccordion
              cart={cart}
              totalPrice={itemsCost}
              containerClasses="px-5"
              defaultExpanded
              header={!single}
            />
          </div>
        )}
      </div>
      {deliveryCharges > 0 ? (
        <div className="flex items-center py-4 fixed left-0 right-0 md:absolute md:-left-5 md:-right-5 bottom-[195px] border-surface border-t bg-white">
          <div className="w-2/12 pl-5">
            <FaTruckMoving size={24} />
          </div>
          <div className="w-6/12 font-semibold">Delivery Fee</div>
          <div className="w-4/12 font-medium text-right pr-5">
            ${deliveryCharges.toFixed(2)}
          </div>
        </div>
      ) : null}
      {(cart.length > 0 || flashingCart.length > 0) && (
        <div className="fixed md:absolute border-t-surface border-t-4 bottom-0 left-0 right-0 md:-left-5 md:-right-5 px-5 h-[195px]">
          <div className="flex items-center justify-between my-4">
            <div className="font-bold text-2xl">Sub Total</div>
            <div className="font-bold text-2xl">
              {formatPrice(fCost + itemsCost + deliveryCharges).slice(1)}
            </div>
          </div>
          <PrimaryButton
            text={data?.data.CreditLimitStatus ? "Next" : "Pay Now"}
            onClick={() => {
              if (data?.data.CreditLimitStatus) {
                setStage(2);
              } else {
                createDraft();
              }
            }}
            fullWidth
            disabled={paymentLoading}
          />
          <div className="mt-4">
            <SecondaryButton
              text={deliveryCharges ? "Delivery Breakdown" : "Add Items"}
              fullWidth
              link={deliveryCharges ? undefined : "/shop/industry"}
              onClick={deliveryCharges ? () => setStage(4) : undefined}
              smallestRadius
              disabled={paymentLoading}
            />
          </div>
        </div>
      )}
      <Modal
        visible={deliveryLoading}
        fullWidth
        overlay
        overlayContentFullWidth
        overlayContentPositon="end"
      >
        <div className="bg-white">
          <div className="font-bold text-xl">
            This should take a few moments
          </div>
          <div className="mt-4 font-medium text-sm">
            Please be patient while we are processing your order...
          </div>
          <Lottie loop animationData={deliveryAnimation} className="h-60" />
        </div>
      </Modal>
    </div>
  );
}
