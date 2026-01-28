import React from "react";
import type { RefMethods } from "../page";
import type { PricingDetails } from "@/types/supplier-form";

type ResponseInputProps = {
  value: string;
  onChange: (newValue: string) => void;
};

const DeliveryPricing = React.forwardRef<RefMethods<PricingDetails>>(
  function (_, ref) {
    const [details, setDetails] = React.useState<PricingDetails>({
      DeliveryAndPackagingRules: "",
      DeliveryConditions: "",
      PackagingCharges: "",
      MiscellaneousCharges: "",
      Definitions: "",
    });

    React.useImperativeHandle(
      ref,
      () => ({
        submit: () => details,
      }),
      [details],
    );

    return (
      <>
        <div className="text-2xl font-bold my-4">Delivery Pricing Form</div>
        <div className="text-xl font-bold mb-1">Delivery & Pricing Rules</div>
        <div className="text-xs font-light mb-4">
          Examples: Different Sizes, their Delivery, Packaging, Requirements,
          Permits, Lead Time, Inspection, Vehicle Type etc.
        </div>
        <ResponseInput
          value={details.DeliveryAndPackagingRules}
          onChange={(newRules) =>
            setDetails((curr) => ({
              ...curr,
              DeliveryAndPackagingRules: newRules,
            }))
          }
        />
        <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />

        <div className="text-xl font-bold mb-1 mt-4">Packaging Charges</div>
        <div className="text-xs font-light mb-4">
          Examples: Packaging Types; Fixed Packaging Costs; Lineal Packaging
          Charges, Requirements, Minimum & Maximum, Wraps. Crates, Exclusions
          etc.
        </div>
        <ResponseInput
          value={details.PackagingCharges}
          onChange={(newRules) =>
            setDetails((curr) => ({
              ...curr,
              PackagingCharges: newRules,
            }))
          }
        />
        <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />

        <div className="text-xl font-bold mb-1 mt-4">Miscellaneous Charges</div>
        <div className="text-xs font-light mb-4">
          Examples: Standard & Non-Standard Colours, Minimum & Maximum Order
          Size, Products Returns & Refunds, Return Delivery Charges, Small
          Orders, Cut Back, Pallet Charges etc.
        </div>
        <ResponseInput
          value={details.MiscellaneousCharges}
          onChange={(newRules) =>
            setDetails((curr) => ({
              ...curr,
              MiscellaneousCharges: newRules,
            }))
          }
        />
        <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />

        <div className="text-xl font-bold mb-1 mt-4">Delivery Conditions</div>
        <div className="text-xs font-light mb-4">
          Examples: Delivery Length Limits, Dedicated Vehicles, Multi Drop,
          Escort Requirements, Site Inspections, Permits, Variable Fees
          (Location, Time, Product) etc.
        </div>
        <ResponseInput
          value={details.DeliveryConditions}
          onChange={(newRules) =>
            setDetails((curr) => ({
              ...curr,
              DeliveryConditions: newRules,
            }))
          }
        />
        <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />

        <div className="text-xl font-bold mb-1 mt-4">Definitions</div>
        <div className="text-xs font-light mb-4">
          Examples: Commercial Drop, Residential Drop, Requirements & Specifics
          etc.
        </div>
        <ResponseInput
          value={details.Definitions}
          onChange={(newRules) =>
            setDetails((curr) => ({
              ...curr,
              Definitions: newRules,
            }))
          }
        />
        <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />
      </>
    );
  },
);

function ResponseInput({ value, onChange }: ResponseInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      className="w-full resize-none bg-surface p-4 rounded-pova-lg text-black placeholder:on-surface 
      focus:outline focus:outline-2 focus:outline-primary font-medium"
      style={{ overflow: "hidden" }}
    />
  );
}

DeliveryPricing.displayName = "Delivery Pricing";
export default DeliveryPricing;
