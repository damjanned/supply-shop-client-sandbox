import React from "react";
import { IoCaretBack } from "react-icons/io5";
import type { DeliveryDetail } from ".";
import { useAppSelector } from "@/redux/hooks";
import { selectCart, selectSupplierCheckouts } from "@/redux/app";
import { selectFlashingCart } from "@/redux/flashings";
import { SupplierDelivery } from "@/components/SupplierDelivery";

type Props = {
  setStage: React.Dispatch<React.SetStateAction<number>>;
  deliveryDetails: Array<DeliveryDetail>;
};

type RowProps = {
  record: DeliveryDetail;
  supplierCheckout: ReturnType<typeof selectSupplierCheckouts>[0];
  cart: ReturnType<typeof selectCart>;
  flashingCart: ReturnType<typeof selectFlashingCart>;
};

export default function DeliveryDetails({ setStage, deliveryDetails }: Props) {
  const supplierCheckouts = useAppSelector(selectSupplierCheckouts);
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);

  return (
    <div>
      <div className="flex gap-x-2.5 items-center">
        <div
          className="bg-surface rounded-full w-10 h-10 flex justify-center items-center"
          onClick={() => setStage(1)}
        >
          <IoCaretBack />
        </div>
        <div className="text-pova-heading font-bold">Delivery</div>
      </div>
      <div className="space-y-4 mt-3">
        {deliveryDetails.map((supplierRecord) => {
          const supCheck = supplierCheckouts.find(
            (r) => r.supplierId === supplierRecord.supplierId,
          );
          return (
            <SupplierDelivery
              key={supplierRecord.supplierId}
              cart={cart}
              flashingCart={flashingCart}
              supplierCheckout={supCheck as RowProps["supplierCheckout"]}
              record={supplierRecord}
            />
          );
        })}
      </div>
    </div>
  );
}
