import { useRouter } from "next/navigation";
import React from "react";
import type { Fence as FenceT } from ".";
import {
  FenceType,
  FencingDetailResponse,
  GateDetailResponse,
  GateType,
} from "@/types/fencing";
import Loader from "@/components/Loader";
import Length from "../Length";
import Fence from "../Fence";
import Stepper from "@/components/Stepper";
import Controll from "@/components/Controls";
import Config from "../Config";
import Gates from "../Gates";

export interface FormattedFenceType
  extends Omit<FenceType, "colours" | "extensions"> {
  colours: Array<{ _id: string; Colour_Name: string; Colour_Code: string }>;
  extensions: Array<
    Omit<FenceType["extensions"][0], "colours"> & {
      colours?: Array<{
        _id: string;
        Colour_Name: string;
        Colour_Code: string;
      }>;
    }
  >;
}

export interface FormattedGateType
  extends Omit<GateType, "colours" | "extensions"> {
  colours: Array<{ _id: string; Colour_Name: string; Colour_Code: string }>;
  extensions: Array<
    Omit<GateType["extensions"][0], "colours"> & {
      colours?: Array<{
        _id: string;
        Colour_Name: string;
        Colour_Code: string;
      }>;
    }
  >;
}

type Props = {
  fence: FenceT;
  fenceData?: {
    data: {
      fence_types: Array<FormattedFenceType>;
      gate_types: Array<FormattedGateType>;
    };
  };
  loading?: boolean;
  error?: {
    message: string;
    status?: number;
  };
  fetcher: () => Promise<{
    data?:
      | {
          data: FencingDetailResponse;
        }
      | undefined;

    error?: {
      message: string;
      status?: number;
    };
  }>;
  detailsError?: {
    message: string;
    status?: number;
    extraData?: any;
  };
  detailsLoading?: boolean;
  detailsData?: {
    data: FencingDetailResponse;
  };
  setFence: React.Dispatch<React.SetStateAction<FenceT>>;
  setShowItems: React.Dispatch<React.SetStateAction<boolean>>;
  fenceColourRef: React.MutableRefObject<string>;
  gateDetails: {
    [key: string]: GateDetailResponse;
  };
  setGateDetails: React.Dispatch<
    React.SetStateAction<{
      [key: string]: GateDetailResponse;
    }>
  >;
};

export default function Builder({
  fence,
  fenceData,
  loading,
  error,
  fetcher,
  detailsLoading,
  detailsError,
  detailsData,
  setFence,
  setShowItems,
  fenceColourRef,
  gateDetails,
  setGateDetails,
}: Props) {
  const [step, setStep] = React.useState(1);
  const [heightError, setHeightError] = React.useState("");
  const [fdError, setFdError] = React.useState("");
  const [gcError, setGcError] = React.useState("");
  const router = useRouter();

  let rightActive = true;

  switch (step) {
    case 1:
      const type = typeof fence.totalFenceLength;
      if (type === "string") {
        const value = parseFloat(fence.totalFenceLength as string);
        rightActive = !isNaN(value) && value > 0;
      } else {
        rightActive = !!fence.totalFenceLength;
      }
      break;
    case 2:
      rightActive = !!fence.colour;
      break;
    case 3:
      rightActive =
        !!fence.panelHeight &&
        typeof fence.runEnds === "number" &&
        typeof fence.corners === "number" &&
        !heightError &&
        !!fence.groundClearance &&
        !!fence.footingDepth &&
        !fdError &&
        !gcError;
      break;
  }

  function onStepClick(stepNo: number) {
    if (stepNo === 1) {
      setStep(1);
    } else if (stepNo === 2) {
      const fenceLength =
        typeof fence.totalFenceLength === "string"
          ? parseFloat(fence.totalFenceLength)
          : (fence.totalFenceLength as number);
      if (!isNaN(fenceLength) && fenceLength > 0) {
        setStep(2);
        setFence((curr) => ({
          ...curr,
          totalFenceLength: fenceLength,
        }));
      }
    } else if (stepNo === 3) {
      if (fence.colour) {
        setStep(3);
        if (fence.colour !== fenceColourRef.current) {
          fenceColourRef.current = fence.colour;
          fetcher();
        }
      }
    } else if (
      !!fence.panelHeight &&
      typeof fence.runEnds === "number" &&
      typeof fence.corners === "number" &&
      !heightError &&
      fence.groundClearance &&
      fence.footingDepth &&
      !fdError &&
      !gcError
    ) {
      setStep(4);
    }
  }

  function onLeftClick() {
    if (step === 1) {
      router.back();
    } else {
      setStep((curr) => curr - 1);
    }
  }

  function onRightClick() {
    setStep((curr) => {
      if (curr === 2 && fence.colour !== fenceColourRef.current) {
        fenceColourRef.current = fence.colour as string;
        fetcher();
      }
      return curr + 1;
    });
  }

  return (
    <>
      <Stepper
        steps={["Length", "Fence", "Config", "Gates"]}
        step={step}
        onStepClick={onStepClick}
      />
      <div className="pt-16 pb-64 px-5 h-full w-full overflow-y-scroll max-md:no-scrollbar relative">
        {error || detailsError ? (
          <div className="h-full w-full flex justify-center items-center">
            Something went wrong
          </div>
        ) : loading || detailsLoading ? (
          <div className="h-full w-full flex justify-center items-center">
            <Loader size={50} />
          </div>
        ) : step === 1 ? (
          <Length
            setLength={(length: string | number) =>
              setFence((curr) => ({
                ...curr,
                totalFenceLength: length,
              }))
            }
            length={fence.totalFenceLength}
          />
        ) : step === 2 ? (
          <Fence
            data={fenceData!.data!.fence_types}
            fenceData={fence}
            setFence={setFence}
          />
        ) : step === 3 ? (
          <Config
            fenceData={fence}
            setFence={setFence}
            data={fenceData!.data!.fence_types}
            heightError={heightError}
            setHeightError={setHeightError}
            depthError={fdError}
            setDepthError={setFdError}
            clearanceError={gcError}
            setClearanceError={setGcError}
          />
        ) : (
          <Gates
            fenceData={fence}
            setFence={setFence}
            details={detailsData!.data as FencingDetailResponse}
            setShowItems={setShowItems}
            data={fenceData!.data.gate_types}
            gateDetails={gateDetails}
            setGateDetails={setGateDetails}
          />
        )}
        <Controll left onClick={onLeftClick} />
        {step !== 4 && (
          <Controll inactive={!rightActive} onClick={onRightClick} />
        )}
      </div>
    </>
  );
}
