import Image from "next/image";
import type { Fence } from "../Container";
import { footingDepthGuide, getHeightOptions, getWidthOptions } from "../utils";
import TextInput from "@/components/TextInput";
import Radio from "@/components/Radio";
import { BLUR_URL } from "@/lib/utils";
import React from "react";
import type { FormattedFenceType } from "../Container/builder";

type Props = {
  fenceData: Fence;
  setFence: React.Dispatch<React.SetStateAction<Fence>>;
  data: Array<FormattedFenceType>;
  heightError: string;
  setHeightError: React.Dispatch<React.SetStateAction<string>>;
  depthError: string;
  setDepthError: React.Dispatch<React.SetStateAction<string>>;
  clearanceError: string;
  setClearanceError: React.Dispatch<React.SetStateAction<string>>;
};

export default function Config({
  fenceData,
  setFence,
  data,
  heightError,
  setHeightError,
  depthError,
  setDepthError,
  clearanceError,
  setClearanceError,
}: Props) {
  const fenceItem = data.find((item) => item.type === fenceData.fenceType);
  const heightOptions = fenceData.panelWidth
    ? getHeightOptions(fenceData.panelWidth, fenceItem!.heights)
    : [];
  const ref = React.useRef<HTMLHRElement | null>(null);

  return (
    <>
      <div className="font-bold text-xl py-4">Panel Width</div>
      <div className="flex gap-x-4 items-center">
        {getWidthOptions(fenceItem!.widths).map((option) => (
          <div
            key={option.id}
            className={`bg-white rounded-pova-lg w-[110px] h-[150px] cursor-pointer border-2 p-2 pt-5 ${
              option.id === fenceData.panelWidth?.toString()
                ? "border-primary"
                : "border-surface"
            }`}
            onClick={() =>
              setFence((curr) => ({
                ...curr,
                panelWidth: parseInt(option.id),
                panelHeight: undefined,
              }))
            }
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${option.extraData.image}`}
              alt={`Panel ${option.label}`}
              placeholder="blur"
              className="w-[60px] h-[60px] object-contain mx-auto"
              blurDataURL={BLUR_URL}
              width={option.extraData.width}
              height={option.extraData.height}
              unoptimized
            />
            <div className="text-center text-2xl font-bold">
              x{option.extraData.count}
            </div>
            <div className="font-semibold text-xs mt-3">{option.label}</div>
          </div>
        ))}
      </div>
      {fenceData.panelWidth && (
        <>
          <hr className="my-4 -mx-5 bg-surface h-[3px]" />
          <div className="font-bold text-xl pb-4">
            Panel Height
            {fenceData.extension && (
              <>
                <br />
                <span className="text-xs font-medium text-on-surface-variant">
                  (including 300mm extension height)
                </span>
              </>
            )}
          </div>
          <div className="flex gap-x-4 items-center">
            {heightOptions.map((option) => (
              <div
                key={option.id}
                className={`bg-white  rounded-pova-lg w-[110px] h-[150px] border-2 cursor-pointer p-2 pt-6 ${
                  option.id === fenceData.panelHeight?.toString()
                    ? " border-primary"
                    : "border-surface"
                }`}
                onClick={() => {
                  setFence((curr) => {
                    const value = parseInt(option.id);
                    const sheetNumber = Math.ceil(
                      (curr.panelWidth as number) / 800,
                    );
                    const index = value <= 1800 ? 0 : 1;
                    return {
                      ...curr,
                      panelHeight: value,
                      footingDepth:
                        footingDepthGuide[fenceData.terrain as string][index][
                          sheetNumber
                        ],
                    };
                  });
                  ref.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${option.extraData.image}`}
                  alt={`Panel Height ${option.label}`}
                  sizes="120px"
                  placeholder="blur"
                  className="w-[80px] h-[60px] object-contain"
                  blurDataURL={BLUR_URL}
                  width={option.extraData.width}
                  height={option.extraData.height}
                  unoptimized
                />
                <div className=" font-semibold text-xs mt-9">
                  {option.label}
                </div>
              </div>
            ))}
          </div>
          <label
            className="font-bold text-xl py-4 block"
            htmlFor="custom-height"
          >
            Custom Height
          </label>
          <TextInput
            id="custom-height"
            placeholder="mm"
            value={fenceData.panelHeight?.toString() || ""}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              setFence((curr) => {
                if (!isNaN(intValue)) {
                  const maxHeight =
                    (curr.panelWidth as number) >= 3100
                      ? 1790
                      : Number.MAX_VALUE;
                  if (intValue > maxHeight) {
                    setHeightError(
                      "Max height with 4 sheets panel can be 1790MM",
                    );
                    return curr;
                  }
                  const sheetNumber = Math.ceil(
                    (curr.panelWidth as number) / 800,
                  );
                  const index = intValue <= 1800 ? 0 : 1;
                  const fd = fenceData.footingDepth
                    ? fenceData.footingDepth
                    : footingDepthGuide[fenceData.terrain as string][index][
                        sheetNumber
                      ];
                  const maxAllowedHeight = Math.min(
                    3150 - fd - (fenceData.groundClearance || 50),
                    fenceData?.extension ? 2390 : 2090,
                  );
                  if (intValue > maxAllowedHeight) {
                    setHeightError(`Max allowed height is ${maxAllowedHeight}`);
                    return curr;
                  } else {
                    setHeightError("");
                  }
                  return {
                    ...curr,
                    panelHeight: intValue,
                    footingDepth: fd,
                  };
                } else {
                  return {
                    ...curr,
                    panelHeight: newValue as "",
                  };
                }
              });
            }}
            errorMessage={heightError}
            inputMode="numeric"
          />
          <hr className="my-4 -mx-5 bg-surface h-[3px]" ref={ref} />
          <label className="font-bold text-xl my-4 block" htmlFor="run-ends">
            Run Ends
          </label>
          <TextInput
            id="run-ends"
            placeholder="Qty"
            value={fenceData.runEnds?.toString() || ""}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              if (!isNaN(intValue)) {
                setFence((curr) => ({
                  ...curr,
                  runEnds: intValue,
                }));
              } else if (newValue === "") {
                setFence((curr) => ({
                  ...curr,
                  runEnds: newValue,
                }));
              }
            }}
            inputMode="numeric"
          />
          <div className="flex flex-col gap-y-4 mt-4">
            {(!fenceData.panelHeight || fenceData.panelHeight <= 2400) && (
              <Radio
                id="run-end-standard"
                label={
                  <span className="font-medium text-on-surface cursor-pointer">
                    Standard Post
                  </span>
                }
                checked={fenceData.runEndsConfig === "standard"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFence((curr) => ({
                      ...curr,
                      runEndsConfig: "standard",
                    }));
                  }
                }}
                name="run-end-config"
                type="radio"
              />
            )}
            <Radio
              id="run-end-square"
              label={
                <span className="font-medium text-on-surface cursor-pointer">
                  End with Square Post
                </span>
              }
              checked={fenceData.runEndsConfig === "square"}
              onChange={(e) => {
                if (e.target.checked) {
                  setFence((curr) => ({
                    ...curr,
                    runEndsConfig: "square",
                  }));
                }
              }}
              name="run-end-config"
              type="radio"
            />
          </div>

          <hr className="my-4 -mx-5 bg-surface h-[3px]" />
          <label className="font-bold text-xl my-4 block" htmlFor="corners">
            Number of Corners
          </label>
          <TextInput
            id="corners"
            placeholder="Qty"
            value={fenceData.corners?.toString() || ""}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              if (!isNaN(intValue)) {
                setFence((curr) => ({
                  ...curr,
                  corners: intValue,
                }));
              } else if (newValue === "") {
                setFence((curr) => ({
                  ...curr,
                  corners: newValue,
                }));
              }
            }}
            inputMode="numeric"
          />
          <div className="flex flex-col gap-y-4 mt-4">
            {(!fenceData.panelHeight || fenceData.panelHeight <= 2400) && (
              <Radio
                id="corner-standard"
                label={
                  <span className="font-medium text-on-surface cursor-pointer">
                    Standard Post
                  </span>
                }
                checked={fenceData.cornersConfig === "standard"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFence((curr) => ({
                      ...curr,
                      cornersConfig: "standard",
                    }));
                  }
                }}
                name="corner-config"
                type="radio"
              />
            )}
            <Radio
              id="corner-square"
              label={
                <span className="font-medium text-on-surface cursor-pointer">
                  Corner with Square Post
                </span>
              }
              checked={fenceData.cornersConfig === "square"}
              onChange={(e) => {
                if (e.target.checked) {
                  setFence((curr) => ({
                    ...curr,
                    cornersConfig: "square",
                  }));
                }
              }}
              name="corner-config"
              type="radio"
            />
          </div>

          <hr className="my-4 -mx-5 bg-surface h-[3px]" />
          <Radio
            id="add-post-stiffners"
            label={
              <span className="font-medium text-on-surface cursor-pointer">
                Add Post Stiffners
              </span>
            }
            checked={fenceData.postStiffners || false}
            onChange={(e) =>
              setFence((curr) => ({
                ...curr,
                postStiffners: e.target.checked,
              }))
            }
          />
          <hr className="mt-4 -mx-5 bg-surface h-[3px]" />

          <label
            className="font-bold text-xl py-4 block"
            htmlFor="footing-depth"
          >
            Post Footing Depth
          </label>
          <TextInput
            id="footing-depth"
            placeholder="mm"
            value={fenceData.footingDepth?.toString() || ""}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              if (!isNaN(intValue)) {
                const maxAllowedValue =
                  3150 -
                  (fenceData.panelHeight || 0) -
                  (fenceData.groundClearance || 50);
                if (intValue > maxAllowedValue) {
                  setDepthError(`Max Allowed depth is ${maxAllowedValue}`);
                  return;
                }
                setFence((curr) => ({
                  ...curr,
                  footingDepth: intValue,
                }));
              } else if (newValue === "") {
                setFence((curr) => ({
                  ...curr,
                  footingDepth: newValue,
                }));
              }
              setDepthError("");
            }}
            errorMessage={depthError}
            inputMode="numeric"
          />
          <hr className="mt-4 -mx-5  bg-surface h-[3px]" />
          <label
            className="font-bold text-xl py-4 block"
            htmlFor="ground-clearance"
          >
            Ground Clearance
          </label>
          <TextInput
            id="ground-clearance"
            placeholder="mm"
            value={fenceData.groundClearance?.toString() || ""}
            onChange={(newValue) => {
              const intValue = parseInt(newValue);
              if (!isNaN(intValue)) {
                const maxAllowedValue =
                  3150 -
                  (fenceData.panelHeight || 0) -
                  (fenceData.footingDepth || 0);
                if (intValue > maxAllowedValue) {
                  setClearanceError(
                    `Max allowed clearance is ${maxAllowedValue}`,
                  );
                  return;
                }
                setFence((curr) => ({
                  ...curr,
                  groundClearance: intValue,
                }));
              } else if (newValue === "") {
                setFence((curr) => ({
                  ...curr,
                  groundClearance: newValue,
                }));
              }
              setClearanceError("");
            }}
            errorMessage={clearanceError}
            inputMode="numeric"
          />
        </>
      )}
    </>
  );
}
