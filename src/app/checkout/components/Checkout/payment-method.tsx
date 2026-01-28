import PaymentMethod from "@/components/Payment Method";
import useMutation from "@/hooks/useMutation";
import {
  formatPrice,
  getAllFlashingsPriceAndShapes,
  getAllItemsPrice,
} from "@/lib/utils";
import {
  selectCart,
  selectToken,
  selectCheckout,
  setCart,
  setOrderId,
  selectSupplierCheckouts,
  resetSupplierCheckouts,
  selectJobRef,
  setJobRef,
} from "@/redux/app";
import { selectDetails } from "@/redux/auth";
import { selectFlashingCart, setFlashingCart } from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { FlashingOrder, OrderCart } from "@/types/order-cart";
import { useRouter } from "next/navigation";

type Props = {
  setStage: (stage: number) => void;
  deliveryCharges: number;
  creditLimit: { total: number; available: number };
};

export default function PaymentMethodSelector({
  setStage,
  deliveryCharges,
  creditLimit,
}: Props) {
  const cart = useAppSelector(selectCart);
  const flashingsCart = useAppSelector(selectFlashingCart);
  const token = useAppSelector(selectToken);
  const checkout = useAppSelector(selectCheckout);
  const jobRef = useAppSelector(selectJobRef);
  const supplierCheckouts = useAppSelector(selectSupplierCheckouts);
  const authDetails = useAppSelector(selectDetails);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [executor, { loading }] = useMutation<
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
      paymentType: "CreditLimit" | "Draft";
      Order_Job_Reference?: string;
    },
    { data: { order: { _id: string } } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/create`,
    token,
  });

  async function processPayment(draft?: boolean) {
    const { error, data: response } = await executor({
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
      supplierCheckouts,
      // checkoutType: checkout.type === "Delivery" ? "Delivery" : "Pickup",
      // deliveryOrPickupDate: checkout.date,
      flashings: flashingsCart.map((flashing) => ({
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
      paymentType: draft ? "Draft" : "CreditLimit",
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
      if (draft) {
        router.replace(
          `/order/${response!.data.order._id}/payment?next=success`,
        );
      } else {
        router.replace("/order/success");
      }
    }
  }

  const [shapes, fCost] = getAllFlashingsPriceAndShapes(flashingsCart, false);
  const itemsCost = getAllItemsPrice(cart, false);

  return (
    <div className="h-[calc(100vh-203px)] !h-[calc(100svh-203px)] flex flex-col pt-3">
      <PaymentMethod
        user={authDetails.name as string}
        limitAvailable={creditLimit.available}
        limitTotal={creditLimit.total}
        onPayNow={() => processPayment(true)}
        onPayCredit={() => processPayment(false)}
        creditLoading={loading}
      />
      <div className="fixed md:absolute border-t-surface border-t-4 bottom-0 left-0 right-0 md:-left-5 md:-right-5 p-5 flex justify-between items-center font-bold text-2xl">
        <div>Remaining</div>
        <div>{formatPrice(fCost + itemsCost + deliveryCharges).slice(1)}</div>
      </div>
    </div>
  );
}
