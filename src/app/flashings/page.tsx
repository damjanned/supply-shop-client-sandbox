"use client";
import { ReactFlowProvider } from "reactflow";
import Draw from "./components/Draw";
import React from "react";
import Specification from "./components/Specifications";
import useQuery from "@/hooks/useQuery";
import RequireLocation from "@/components/RequireLocation";
import { useAppSelector } from "@/redux/hooks";
import { selectCheckout } from "@/redux/app";
import { FlashingVariant } from "@/types/flashing";

// const cache = {
//   key: "pricing",
//   duration: 14_400,
// };

function Flashings() {
  const [step, setStep] = React.useState(1);
  const checkout = useAppSelector(selectCheckout);
  const { data } = useQuery<{
    data: Array<{ Flashing_Variants: Array<FlashingVariant> }>;
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/flashingBranchItems/user/getMany?location=${checkout.location}`,
    {
      // cache,
    },
  );

  return (
    <ReactFlowProvider>
      {step === 1 ? (
        <Draw setStep={setStep} />
      ) : (
        <Specification
          setStep={setStep}
          data={data?.data[0]?.Flashing_Variants}
        />
      )}
    </ReactFlowProvider>
  );
}

export default function FlashingsPage() {
  return (
    <RequireLocation noContainer>
      <Flashings />
    </RequireLocation>
  );
}
