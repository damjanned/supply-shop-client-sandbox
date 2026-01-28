"use client";

import PageContainer from "@/components/PageContainer";
import Stepper from "@/components/Stepper";
import React from "react";
import Cart from "./components/Cart";
import Controll from "@/components/Controls";
import { useAppSelector } from "@/redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Delivery from "./components/Delivery";
import { selectCart, selectJobRef, selectToken } from "@/redux/app";
import Checkout from "./components/Checkout";
import RequireAuth from "@/components/RequireAuth";
import { selectFlashingCart } from "@/redux/flashings";

export default function CheckoutPage() {
  const query = useSearchParams();
  const [step, setStep] = React.useState(
    query.get("step") ? parseInt(query.get("step") as string) : 1,
  );
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const jobRef = useAppSelector(selectJobRef);
  const token = useAppSelector(selectToken);
  const router = useRouter();

  const steps: [string, string, string] = ["Cart", "Delivery", "Checkout"];

  function moveToStep(step: number) {
    if (step <= 2) {
      setStep(step);
    }
  }

  function leftControllClick() {
    setStep(1);
  }

  function rightControllClick() {
    if (step === 1) {
      setStep(2);
    } else if (token) {
      setStep(3);
    } else {
      router.push(encodeURI("/auth?next=/checkout?step=3"));
    }
  }

  return (
    <>
      <title>Pova | {steps[step - 1]}</title>
      <PageContainer>
        <div className="relative h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
          <Stepper step={step} onStepClick={moveToStep} steps={steps} />
          <div className="pt-16">
            {step === 1 ? (
              <Cart onNext={rightControllClick} />
            ) : step === 2 ? (
              <Delivery />
            ) : (
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            )}
            {step === 2 && <Controll left onClick={leftControllClick} />}
            {step === 2 && (
              <Controll
                onClick={rightControllClick}
                inactive={cart.length === 0 && flashingCart.length === 0}
              />
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
