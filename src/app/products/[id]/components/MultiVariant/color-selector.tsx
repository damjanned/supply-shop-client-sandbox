"use client";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import { VariantSizeMap } from "../ProductDetails";

type Props = {
  recordObject: VariantSizeMap[""];
  range?: string;
  onRangeChange: (newRange: string) => void;
  colour?: string;
  onChange: (newColour: string) => void;
};

export default function ColorSelector({
  recordObject,
  colour,
  onChange,
  range,
  onRangeChange,
}: Props) {
  function renderColour(
    item: DropdownOption<{ Code: string; Price: number; SecCode?: string }>,
  ) {
    return (
      <div
        className={`flex items-center px-9 py-4 cursor-pointer justify-between ${
          item.id !== colour ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="flex items-center">
          {item.extraData!.SecCode ? (
            <div className="w-6 h-6 rounded-full relative">
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full"
                style={{
                  backgroundColor: `#${item.extraData!.Code}`,
                }}
              />
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full"
                style={{
                  backgroundColor: `#${item.extraData!.SecCode}`,
                  clipPath: "path('M 12,0 A 12 12 0 1 1 12 12')",
                }}
              />
            </div>
          ) : (
            <div
              className="rounded-full w-6 h-6"
              style={{ backgroundColor: `#${item.extraData!.Code}` }}
            />
          )}
          <div className="text-sm font-semibold ml-2">{item.label}</div>
        </div>
        <div className="text-on-surface">
          ${item.extraData!.Price.toFixed(2)}
        </div>
      </div>
    );
  }
  function renderCategory(
    item: DropdownOption<{ minPrice: number; maxPrice: number }>,
  ) {
    return (
      <div
        className={`flex items-center px-9 py-4 cursor-pointer justify-between ${
          item.id !== range ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="text-sm font-semibold ml-2">{item.label}</div>
        <div className="text-on-surface">
          {item.extraData!.minPrice === item.extraData!.maxPrice
            ? `$${item.extraData!.minPrice.toFixed(2)}`
            : `$${item.extraData!.minPrice.toFixed(
                2,
              )}-$${item.extraData!.maxPrice.toFixed(2)}}`}
        </div>
      </div>
    );
  }

  const categoryOptions = Object.entries(recordObject.ranges).map(
    ([catId, rec]) => ({
      id: catId,
      label: rec.categoryName,
      extraData: {
        minPrice: rec.minPrice,
        maxPrice: rec.maxPrice,
      },
    }),
  );

  const colourOptions = range
    ? recordObject.ranges[range].colours.map((col) => ({
        id: col.id,
        label: col.Colour_Name,
        extraData: {
          Code: col.Colour_Code,
          Price: col.price,
          SecCode: col.Secondary_Colour_Code,
          CustomMeasure: col.CustomMeasure,
          CustomMeasureUnit: col.CustomMeasureUnit,
          CustomMinSize: col.CustomMinSize,
          CustomMaxSize: col.CustomMaxSize,
          VariantSize: col.Variant_Size,
          stockLengths: col.stockLengths,
        },
      }))
    : [];

  return (
    <div className="px-5">
      <div className="py-4 border-b-2 border-b-surface px-5 -mx-5 text-xl font-bold truncate">
        {recordObject.size}
      </div>
      {categoryOptions.length > 0 && (
        <>
          <div className="mt-4 font-bold text-2xl  mb-5">
            Choose Colour Range
          </div>
          <Dropdown<{ minPrice: number; maxPrice: number }>
            value={range || ""}
            onChange={onRangeChange}
            placeholder="Select Colour Range"
            options={categoryOptions}
            renderItem={renderCategory}
            disabled={categoryOptions.length === 1}
          />
        </>
      )}
      {colourOptions.length > 0 && (
        <>
          <div className="mt-7 font-bold text-2xl">Choose Colour</div>
          <div className="mt-6">
            <Dropdown<{ Code: string; Price: number; SecCode?: string }>
              value={colour || ""}
              onChange={onChange}
              placeholder="Select Colour"
              options={colourOptions}
              renderItem={renderColour}
              disabled={colourOptions.length === 1}
            />
          </div>
        </>
      )}
    </div>
  );
}
