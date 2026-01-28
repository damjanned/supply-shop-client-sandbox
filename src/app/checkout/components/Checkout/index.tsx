"use client";

import React from "react";
import Items from "./items";
import PaymentMethod from "./payment-method";
import DeliveryDetails from "./delivery";

export type DeliveryDetail = {
  cost: number;
  reasoning: string[];
  supplierId: string;
  supplierName: string;
  items: string[];
  flashings: string[];
};

export default function Checkout() {
  const [stage, setStage] = React.useState(1);
  const [deliveryDetails, setDeliveryDetails] = React.useState<
    Array<DeliveryDetail>
  >([]);
  const [creditLimit, setCreditLimit] = React.useState({
    total: 0,
    available: 0,
  });

  let component;
  const deliveryCharges = deliveryDetails.reduce(
    (acc, curr) => acc + curr.cost,
    0,
  );
  switch (stage) {
    case 1:
      component = (
        <Items
          setStage={setStage}
          deliveryCharges={deliveryCharges}
          detailsExist={deliveryDetails.length > 0}
          setDeliveryDetails={setDeliveryDetails}
          setCreditLimit={setCreditLimit}
        />
      );
      break;
    case 2:
      component = (
        <PaymentMethod
          setStage={setStage}
          deliveryCharges={deliveryCharges}
          creditLimit={creditLimit}
        />
      );
      break;
    case 4:
      component = (
        <DeliveryDetails
          setStage={setStage}
          deliveryDetails={deliveryDetails}
        />
      );
      break;
  }
  return component;
}
