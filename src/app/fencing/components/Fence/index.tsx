import type { Fence as FenceStateType } from "../Container";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import Image from "next/image";
import { BLUR_URL } from "@/lib/utils";
import { getColourOptions, renderColour, terrainOptions } from "../utils";
import React from "react";
import type { FormattedFenceType } from "../Container/builder";

type Props = {
  data: Array<FormattedFenceType>;
  fenceData: Pick<
    FenceStateType,
    "extension" | "fenceType" | "colour" | "terrain" | "gates"
  >;
  setFence: React.Dispatch<React.SetStateAction<FenceStateType>>;
};

function renderFenceType(item: DropdownOption<{ image: string }>) {
  return (
    <div className="relative h-20">
      <Image
        src={item.extraData?.image || ""}
        fill
        alt="Infill Sheet"
        blurDataURL={BLUR_URL}
        className="object-contain"
        sizes="(min-width:1024px) 15vw, (min-width: 768px) 25vw, 50vw"
        placeholder="blur"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-pova" />
      <div className="absolute top-1 left-1 text-on-primary font-bold">
        {item.label}
      </div>
    </div>
  );
}

function renderTerrain(item: DropdownOption<null>, selected?: string) {
  return (
    <div
      className={`px-9 py-4 cursor-pointer ${
        item.id !== selected ? "bg-on-primary" : "bg-surface"
      } hover:bg-surface text-sm font-semibold`}
    >
      {item.label}
    </div>
  );
}

export default function Fence({ data, fenceData, setFence }: Props) {
  const fenceItem = data.find((item) => item.type === fenceData.fenceType);
  const colourOptions = getColourOptions(fenceItem, fenceData.extension);
  return (
    <>
      <label className="block my-4 font-bold text-xl">
        Choose Terrain Type
      </label>
      <Dropdown<null>
        options={terrainOptions}
        value={fenceData.terrain || ""}
        onChange={(newType) =>
          setFence((curr) => ({
            ...curr,
            terrain: newType,
          }))
        }
        renderItem={(item) => renderTerrain(item, fenceData.terrain)}
        placeholder="Select Terrain Type"
      />
      <hr className="my-4 -mx-5 bg-surface h-[3px]" />
      <label className="block my-4 font-bold text-xl">Choose Fence Type</label>
      <Dropdown<{ image: string }>
        options={data.map((fence) => ({
          id: fence.type,
          label: fence.name,
          extraData: {
            image: `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${fence.image}`,
          },
        }))}
        value={fenceData.fenceType || ""}
        onChange={(newType) => {
          setFence((curr) => ({
            ...curr,
            fenceType: newType,
            extension: undefined,
            colour: undefined,
            panelWidth: undefined,
            panelHeight: undefined,
          }));
        }}
        renderItem={renderFenceType}
        placeholder="Select Fence Type"
        listClasses="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-3 pt-4"
      />
      {fenceData.fenceType && (
        <>
          {fenceItem!.extensions && fenceItem!.extensions.length > 0 && (
            <>
              <div className="flex justify-between items-baseline  my-4 ">
                <label className="text-xl font-bold">
                  Choose Fence Extension
                </label>
                <span
                  role="button"
                  onClick={() =>
                    setFence((curr) => ({
                      ...curr,
                      extension: undefined,
                      colour: undefined,
                    }))
                  }
                  className="font-semibold text-sm"
                >
                  Remove
                </span>
              </div>
              <Dropdown<{ image: string }>
                options={fenceItem!.extensions!.map((option) => ({
                  label: option.name,
                  id: option.type,
                  extraData: {
                    image: `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${option.image}`,
                  },
                }))}
                value={fenceData.extension || ""}
                onChange={(newType) =>
                  setFence((curr) => ({
                    ...curr,
                    extension: newType,
                    colour: undefined,
                  }))
                }
                renderItem={renderFenceType}
                placeholder="Select Fence Extension"
                listClasses="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-3 pt-4"
              />
            </>
          )}
          <hr className="mt-4 -mx-5 bg-surface h-[3px]" />
          <label className="block my-4 font-bold text-xl">Choose Colour</label>
          <Dropdown<{ code: string }>
            options={colourOptions}
            value={fenceData.colour || ""}
            onChange={(newType) => {
              setFence((curr) => ({
                ...curr,
                colour: newType,
              }));
            }}
            renderItem={(item) => renderColour(item, fenceData.colour)}
            placeholder="Select Colour"
          />
        </>
      )}
    </>
  );
}
