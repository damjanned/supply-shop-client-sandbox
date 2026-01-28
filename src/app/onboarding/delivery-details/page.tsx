"use client";

import React from "react";
import Explanation from "./components/Explanation";
import PageContainer from "@/components/PageContainer";
import { PrimaryButton } from "@/components/Button";
import Branches from "./components/Branches";
import BranchDetailsForm from "./components/Branch-details";
import DeliveryPricing from "./components/Delivery-pricing";
import { useSearchParams } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import Completed from "./components/Completed";
import { IoCaretBack } from "react-icons/io5";
import type { BranchDetails, PricingDetails } from "@/types/supplier-form";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectSupplierForm, setSupplierForm } from "@/redux/app";

export type RefMethods<T> = {
  submit: () => T;
};

type Payload = {
  supplier: string;
  branchDetails: Array<{
    name: string;
    deliverySchemeForm: Omit<BranchDetails, "name">;
  }>;
  deliveryPricingForm: PricingDetails;
};

export default function DeliveryDetails() {
  const existingForm = useAppSelector(selectSupplierForm);

  const [step, setStep] = React.useState(0);
  const [branches, setBranches] = React.useState<BranchDetails[]>(
    existingForm?.branches || [],
  );
  const [editIndex, setEditIndex] = React.useState(-1);
  const detailsRef = React.useRef<RefMethods<BranchDetails>>(null);
  const pricingRef = React.useRef<RefMethods<PricingDetails>>(null);
  const [detailsValid, setDetailsValid] = React.useState(false);

  const query = useSearchParams();
  const supplier = query.get("supplier") as string;
  const dispatch = useAppDispatch();

  const [executor, { loading }] = useMutation<Payload, any>({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/supplierForms/deliveryInformation`,
  });

  let content;
  let primaryText = "";
  let onClick: () => void = () => {};
  let primaryDisabled = false;
  switch (step) {
    case 0:
      content = <Explanation />;
      primaryText = "Start Form";
      onClick = () => setStep(1);
      break;
    case 1:
      content = (
        <Branches
          branches={branches}
          addBranch={addBranch}
          onEdit={(index) => {
            setEditIndex(index);
            setStep(2);
          }}
          onClone={(index) => addBranch({ ...branches[index], name: "" })}
        />
      );
      primaryText = "Next";
      onClick = () => setStep(3);
      primaryDisabled = branches.length === 0;
      break;
    case 2:
      content = (
        <BranchDetailsForm
          ref={detailsRef}
          defaultBranch={branches[editIndex]}
          onValidityChange={setDetailsValid}
        />
      );
      primaryText = "Save & Exit";
      primaryDisabled = !detailsValid;
      onClick = () => {
        const newDetails = detailsRef.current!.submit();
        setBranches((curr) => [
          ...curr.slice(0, editIndex),
          newDetails,
          ...curr.slice(editIndex + 1),
        ]);
        setStep(1);
        setEditIndex(-1);
        setDetailsValid(false);
      };
      break;
    case 3:
      primaryText = "Send";
      content = <DeliveryPricing ref={pricingRef} />;
      primaryDisabled = loading;
      onClick = async () => {
        const pricingDetails = pricingRef.current!.submit();
        dispatch(
          setSupplierForm({
            branches,
            deliveryPricing: pricingDetails,
          }),
        );
        const { error } = await executor({
          supplier,
          deliveryPricingForm: pricingDetails,
          branchDetails: branches.map(({ name, ...rest }) => ({
            name,
            deliverySchemeForm: rest,
          })),
        });
        if (error) {
          alert("Something went wrong");
          return;
        }
        setStep(4);
      };
      break;
    case 4:
      content = <Completed />;
      break;
  }

  function addBranch(newBranchData?: BranchDetails) {
    setBranches((curr) => {
      setEditIndex(curr.length);
      return [
        ...curr,
        newBranchData || {
          name: "",
          availableDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          estimatedDeliveryTime: "",
          deliveryCost: "",
          pickupAvailable: true,
          pickupDetails: {
            pickupHours: "",
            pickupLocation: "",
          },
        },
      ];
    });
    setStep(2);
  }

  return (
    <PageContainer>
      <div className="h-[calc(100vh-148px)] !h-[calc(100dvh-148px)] overflow-y-auto relative -mx-5 px-5">
        <div className="fixed left-0 w-full max-w-screen-lg lg:left-1/2 lg:-translate-x-1/2 bottom-0 bg-on-primary shadow-pova-lg px-4 py-5">
          <PrimaryButton
            text={primaryText}
            fullWidth
            onClick={onClick}
            disabled={primaryDisabled}
          />
        </div>
        {step > 0 && step < 4 && (
          <div
            className="flex items-center py-2.5 pr-3.5 pl-2.5 bg-surface rounded-3xl absolute top-4 right-5 cursor-pointer gap-x-2"
            role="button"
            onClick={() => {
              setStep((curr) => {
                if (curr == 2 && !branches[branches.length - 1].name) {
                  setBranches((curr) => [...curr.slice(0, curr.length - 1)]);
                }
                return curr === 3 ? curr - 2 : curr - 1;
              });
            }}
          >
            <IoCaretBack />
            <span className="font-semibold text-base">Back</span>
          </div>
        )}
        {content}
      </div>
    </PageContainer>
  );
}
