"use client";
import PageContainer from "@/components/PageContainer";
import Stepper from "@/components/Stepper";
import React from "react";
import Profile from "./components/Profile";
import Orders from "./components/Orders";
import { useSearchParams } from "next/navigation";

export default function Account() {
  const query = useSearchParams();
  const [step, setStep] = React.useState(
    query.get("t") ? parseInt(query.get("t") as string) : 1,
  );

  return (
    <PageContainer>
      <Stepper
        step={step}
        onStepClick={setStep}
        steps={["Profile", "Orders"]}
      />
      <div className="pt-16 h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        {step === 1 ? <Profile /> : <Orders />}
      </div>
    </PageContainer>
  );
}
