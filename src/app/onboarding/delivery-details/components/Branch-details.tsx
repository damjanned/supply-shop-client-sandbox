import React from "react";
import type { RefMethods } from "../page";
import type { BranchDetails } from "@/types/supplier-form";
import TextInput from "@/components/TextInput";
import Radio from "@/components/Radio";

type Props = {
  defaultBranch: BranchDetails;
  onValidityChange: (isValid: boolean) => void;
};

const BranchDetails = React.forwardRef<RefMethods<BranchDetails>, Props>(
  function ({ defaultBranch, onValidityChange }, ref) {
    const [branch, setBranch] = React.useState<BranchDetails>(defaultBranch);

    function availableDayChange(e: React.ChangeEvent<HTMLInputElement>) {
      const checked = e.target.checked;
      const value = e.target.value;
      if (checked) {
        setBranch((curr) => ({
          ...curr,
          availableDays: [...curr.availableDays, value],
        }));
      } else {
        setBranch((curr) => ({
          ...curr,
          availableDays: curr.availableDays.filter((curr) => curr !== value),
        }));
      }
    }

    function pickupChange(e: React.ChangeEvent<HTMLInputElement>) {
      const value = e.target.value;
      const checked = e.target.checked;
      if (checked) {
        setBranch((curr) => ({
          ...curr,
          pickupAvailable: value === "true",
        }));
      }
    }

    React.useImperativeHandle(
      ref,
      () => ({
        submit: () => branch,
      }),
      [branch],
    );

    React.useEffect(() => {
      let isValid = true;
      if (
        !branch.name ||
        !branch.deliveryCost ||
        !branch.estimatedDeliveryTime ||
        branch.availableDays.length === 0
      ) {
        isValid = false;
      } else if (branch.pickupAvailable && !branch.pickupDetails?.pickupHours) {
        isValid = false;
      }
      onValidityChange(isValid);
    }, [branch, onValidityChange]);

    return (
      <>
        <div className="my-4 font-bold text-2xl">Delivery Scheme Form</div>
        <form className="pb-8">
          <label htmlFor="branch-name" className="block text-xl font-bold my-4">
            Enter Branch Name
          </label>
          <TextInput
            fullWidth
            id="branch-name"
            placeholder="Branch Name"
            value={branch.name}
            onChange={(newValue) =>
              setBranch((curr) => ({ ...curr, name: newValue }))
            }
          />
          <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />
          <div className="text-xl font-bold mt-4 mb-2">Available Days</div>
          <div className="text-sm font-light">
            Please select days when delivery is available
          </div>
          <div className="-mx-5">
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Monday</span>}
                checked={branch.availableDays.includes("Monday")}
                value="Monday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Monday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Tuesday</span>}
                checked={branch.availableDays.includes("Tuesday")}
                value="Tuesday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Tuesday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Wednesday</span>}
                checked={branch.availableDays.includes("Wednesday")}
                value="Wednesday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Wednesday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Thursday</span>}
                checked={branch.availableDays.includes("Thursday")}
                value="Thursday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Thursday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Friday</span>}
                checked={branch.availableDays.includes("Friday")}
                value="Friday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Friday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Saturday</span>}
                checked={branch.availableDays.includes("Saturday")}
                value="Saturday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Saturday"
                labelContainerClases="grow"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Sunday</span>}
                checked={branch.availableDays.includes("Sunday")}
                value="Sunday"
                onChange={availableDayChange}
                containerClasses="flex-row-reverse justify-between"
                id="availableDays-Sunday"
                labelContainerClases="grow"
              />
            </div>
          </div>
          <label htmlFor="cut-off" className="block text-xl font-bold my-4">
            Cut-off time for next day delivery
          </label>
          <TextInput
            fullWidth
            id="cut-off"
            placeholder="hh:mm"
            value={branch.cutoffTimeForNextDay}
            onChange={(newValue) =>
              setBranch((curr) => ({ ...curr, cutoffTimeForNextDay: newValue }))
            }
            type="time"
            step="900"
          />
          <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />
          <label htmlFor="edt" className="block text-xl font-bold my-4">
            Estimated Delivery Time
          </label>
          <TextInput
            fullWidth
            id="edt"
            placeholder="e.g. 2 (days)"
            value={branch.estimatedDeliveryTime}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              if (newValue !== "" && isNaN(intValue)) {
                return;
              }
              setBranch((curr) => ({
                ...curr,
                estimatedDeliveryTime: newValue,
              }));
            }}
            inputMode="numeric"
          />
          <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />
          <label
            htmlFor="delivery-cost"
            className="block text-xl font-bold my-4"
          >
            Estimated Delivery Cost
          </label>
          <TextInput
            fullWidth
            id="delivery-cost"
            placeholder="e.g. 100 (dollars)"
            value={branch.deliveryCost}
            onChange={(newValue) => {
              const intValue = parseFloat(newValue);
              if (newValue !== "" && isNaN(intValue)) {
                return;
              }
              setBranch((curr) => ({ ...curr, deliveryCost: newValue }));
            }}
            inputMode="numeric"
            step="any"
          />
          <div className="mt-4 border-b-[3px] border-b-surface -mx-5" />
          <div className="text-xl font-bold mt-4 mb-2">Pick-Up Available</div>
          <div className="-mx-5">
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">Yes</span>}
                checked={branch.pickupAvailable}
                value="true"
                onChange={pickupChange}
                containerClasses="flex-row-reverse justify-between"
                id="pickup-true"
                labelContainerClases="grow"
                type="radio"
              />
            </div>
            <div className="px-5 py-4 border-b-2 border-b-surface">
              <Radio
                label={<span className="text-sm font-semibold">No</span>}
                checked={!branch.pickupAvailable}
                value="false"
                onChange={pickupChange}
                containerClasses="flex-row-reverse justify-between"
                id="pickup-false"
                labelContainerClases="grow"
                type="radio"
              />
            </div>
          </div>
          {branch.pickupAvailable && (
            <>
              <div className="text-xl font-bold mt-4 mb-2">Pick-Up Details</div>
              <div className="text-sm font-light">Pick-Up Hours / Address</div>
              <div className="flex gap-x-4 my-4">
                <TextInput
                  fullWidth
                  placeholder="hh:mm"
                  value={branch.pickupDetails?.pickupHours.slice(0, 5)}
                  onChange={(newValue) =>
                    setBranch((curr) => ({
                      ...curr,
                      pickupDetails: {
                        ...(curr.pickupDetails || { pickupHours: "" }),
                        pickupHours: `${newValue}-${
                          branch.pickupDetails?.pickupHours?.slice(6) ||
                          newValue
                        }`,
                      },
                    }))
                  }
                  type="time"
                  step="900"
                />
                <TextInput
                  fullWidth
                  placeholder="hh:mm"
                  disabled={!branch.pickupDetails?.pickupHours.length}
                  value={branch.pickupDetails?.pickupHours.slice(6)}
                  onChange={(newValue) =>
                    setBranch((curr) => ({
                      ...curr,
                      pickupDetails: {
                        ...curr.pickupDetails,
                        pickupHours: `${curr.pickupDetails!.pickupHours.slice(
                          0,
                          5,
                        )}-${newValue}`,
                      },
                    }))
                  }
                  type="time"
                  step="900"
                />
              </div>
              <TextInput
                fullWidth
                placeholder="Pick-Up Address"
                value={branch.pickupDetails?.pickupLocation}
                onChange={(newValue) =>
                  setBranch((curr) => ({
                    ...curr,
                    pickupDetails: {
                      ...(curr.pickupDetails || { pickupHours: "" }),
                      pickupLocation: newValue,
                    },
                  }))
                }
              />
            </>
          )}
        </form>
      </>
    );
  },
);

BranchDetails.displayName = "BranchDetails";

export default BranchDetails;
