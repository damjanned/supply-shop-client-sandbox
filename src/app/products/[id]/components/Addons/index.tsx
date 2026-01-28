import React from "react";
import { AppState } from "@/redux/app";
import { Product } from "@/types/product";
import { FaCaretDown } from "react-icons/fa6";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import AutoComplete from "@/components/Autocomplete";
import TextInput from "@/components/TextInput";
import { RiCloseLine } from "react-icons/ri";
import Range from "@/components/Range";
import type {
  AddOnData,
  AddOnRowState,
  VariantSizeMap,
} from "../ProductDetails";
import { getItemPrice } from "@/lib/utils";

type Props = {
  addOns: Array<AddOnData>;
  addAddOn: (addOn: AddOnData) => void;
  updateAddOn: (updatedAddOn: AddOnData, index: number) => void;
  data: Array<AddOnItem>;
  rowStates: Array<AddOnRowState>;
  setRowStates: React.Dispatch<React.SetStateAction<Array<AddOnRowState>>>;
  removeAddOn: (index: number) => void;
};

type AddOnItem = {
  accessoryItem: Product;
  accessoryVariant?: Product["Branch_Item_Variants"][0];
};

type AddOnRowProps = {
  addOn?: AppState["cart"][0];
  item: AddOnItem;
  expanded: boolean;
  fade: boolean;
  toggleExpanded: () => void;
  rowState?: AddOnRowState;
  index: number;
  setRowState: React.Dispatch<React.SetStateAction<Array<AddOnRowState>>>;
  onRemove: () => void;
};

type AddOnQtyProps = {
  variant: VariantSizeMap[""]["ranges"][""]["colours"][0];
  qty: number;
  onQtyChange: (newQty: number) => void;
  addNewSize: () => void;
  cuttingErrors: { [key: number]: boolean };
  changeItemSize: (index: number, size: string) => void;
  changeItemQty: (index: number, qty: number) => void;
  cuttingList: Array<{ qty: number; size: number }>;
  errorMessage: string;
};

export default function AddOns({
  addOns,
  addAddOn,
  updateAddOn,
  data,
  rowStates,
  setRowStates,
  removeAddOn,
}: Props) {
  const [expanded, setExpanded] = React.useState(-1);

  function handleMainButton() {
    const state = rowStates[expanded];
    const originalRecord = data[expanded];
    const clientId = `${originalRecord.accessoryItem.Branch_Item.Item_ID}-${
      originalRecord.accessoryVariant?.Variant_ID || "*"
    }`;
    const variant = state.variant;
    if (!variant) {
      alert("Please select colour");
      return;
    }
    if (variant.CustomMeasure) {
      const cuttingList = state.cutting;
      if (cuttingList.length === 0) {
        alert("Atleast one cutting needs to be added");
        return;
      }
      const last = cuttingList[cuttingList.length - 1];
      const list = [...cuttingList];
      if (last.size === 0) {
        list.splice(list.length - 1, 1);
      }
      const errors = list.reduce<Array<number>>((acc, curr, index) => {
        if (
          curr.size > (state.variant!.CustomMaxSize as number) ||
          curr.size < (state.variant!.CustomMinSize as number)
        ) {
          acc.push(index);
        }
        return acc;
      }, []);
      if (list.length === 0) {
        errors.push(0);
      }
      if (errors.length > 0) {
        const errorIndexes: { [key: number]: boolean } = {};
        errors.forEach((index) => {
          errorIndexes[index] = true;
        });
        setRowStates((curr) => [
          ...curr.slice(0, expanded),
          { ...curr[expanded], cuttingErrors: errorIndexes },
          ...curr.slice(expanded + 1),
        ]);
        return;
      }
    } else {
      if (state.qty <= 0) {
        alert("Quantity needs to be at least one");
        return;
      }
    }
    const existingAddonIndex = addOns.findIndex((addon) => {
      const clientId = `${originalRecord.accessoryItem.Branch_Item.Item_ID}-${
        originalRecord.accessoryVariant?.Variant_ID || "*"
      }`;
      return addon.clientId === clientId;
    });
    const addOn: AddOnData = {
      size: state.size,
      range: state.range,
      colourCode: state.variant!.Colour_Code,
      secColourCode: state.variant!.Secondary_Colour_Code,
      product: state.product,
      variant: state.variant!.id,
      qty: state.qty,
      price: state.variant!.price,
      colour: state.variant!.Colour_Name || "Unpainted",
      type: state.variant!.CustomMeasure ? "custom" : "standard",
      name: state.variant!.Variant_Size,
      itemName: state.itemName,
      cuttingList:
        state.cutting.length > 0 &&
        state.cutting[state.cutting.length - 1].size === 0
          ? state.cutting.slice(0, state.cutting.length - 1)
          : state.cutting,
      unit: state.variant!.CustomMeasureUnit || "",
      minSize: state.variant!.CustomMinSize as number,
      maxSize: state.variant!.CustomMaxSize as number,
      clientId,
      stockLengths: state.variant!.stockLengths,
    };
    if (existingAddonIndex < 0) {
      addAddOn(addOn);
    } else {
      updateAddOn(addOn, existingAddonIndex);
    }
    setExpanded(-1);
  }

  return (
    <>
      {data!.map((item, index) => {
        const existingAddonIndex = addOns.findIndex((addon) => {
          const clientId = `${item.accessoryItem.Branch_Item.Item_ID}-${
            item.accessoryVariant?.Variant_ID || "*"
          }`;
          return addon.clientId === clientId;
        });
        const existingAddon =
          existingAddonIndex >= 0 ? addOns[existingAddonIndex] : undefined;
        return (
          <AddOnRow
            addOn={existingAddon}
            item={item}
            key={index.toString()}
            expanded={expanded === index}
            toggleExpanded={() =>
              setExpanded((curr) => (curr === index ? -1 : index))
            }
            rowState={rowStates[index]}
            index={index}
            setRowState={setRowStates}
            fade={expanded >= 0 && expanded !== index}
            onRemove={() => {
              setExpanded(-1);
              removeAddOn(existingAddonIndex);
            }}
          />
        );
      })}
      {expanded !== -1 && (
        <div className="fixed bottom-0 left-0 w-full max-w-screen-lg lg:left-1/2 lg:-translate-x-1/2 px-5 py-4 bg-white shadow-pova-lg z-50">
          <PrimaryButton
            text="Save Changes"
            fullWidth
            onClick={handleMainButton}
          />
        </div>
      )}
    </>
  );
}

function AddOnRow({
  addOn,
  item,
  expanded,
  toggleExpanded,
  rowState,
  setRowState,
  index: rowIndex,
  fade,
  onRemove,
}: AddOnRowProps) {
  const { size, range, variant, qty, cuttingErrors, cutting } = rowState || {};
  const variantSizesMap = item.accessoryItem.Branch_Item_Variants.reduce(
    (acc, curr) => {
      const sizeId = curr.Variant_Size_ID;
      if (!acc[sizeId]) {
        acc[sizeId] = {
          size: curr.Variant_Size,
          sizeType: curr.Variant_Size_Type_Option,
          price: curr.Variant_Selling_Price,
          ranges: {},
        };
      }
      const category = curr.Variant_Colour?.Colour_Category?._id || "Unpainted";
      if (!acc[sizeId]["ranges"][category]) {
        acc[sizeId]["ranges"][category] = {
          categoryName:
            curr.Variant_Colour?.Colour_Category?.Colour_Category_Name ||
            "Unpainted",
          minPrice: curr.Variant_Selling_Price,
          maxPrice: curr.Variant_Selling_Price,
          colours: [],
        };
      }
      acc[sizeId]["ranges"][category].colours.push({
        Colour_Name: curr.Variant_Colour?.Colour_Name || "Unpainted",
        Colour_Code: curr.Variant_Colour?.Colour_Code || "",
        Secondary_Colour_Code: curr.Variant_Colour?.Secondary_Colour_Code || "",
        price: curr.Variant_Selling_Price,
        id: curr.Variant_ID,
        CustomMeasure: curr.Variant_Size_Type === "Non Standard",
        CustomMeasureUnit: curr.Variant_Size_Type_Units,
        CustomMinSize: curr.Variant_Size_Min,
        CustomMaxSize: curr.Variant_Size_Max,
        Variant_Size: curr.Variant_Size,
        stockLengths: curr.Variant_Stock_Lengths?.map((record) => ({
          size: record.Length,
          price: record.Selling_Price,
        })),
      });
      acc[sizeId].price = Math.min(
        curr.Variant_Selling_Price,
        acc[sizeId].price,
      );
      acc[sizeId].ranges[category].minPrice = Math.min(
        acc[sizeId].ranges[category].minPrice,
        curr.Variant_Selling_Price,
      );
      acc[sizeId].ranges[category].maxPrice = Math.min(
        acc[sizeId].ranges[category].maxPrice,
        curr.Variant_Selling_Price,
      );
      return acc;
    },
    {} as VariantSizeMap,
  );

  function changeItemSize(index: number, newSize: string) {
    const size = parseFloat(newSize);
    if (isNaN(size) && newSize !== "") {
      return;
    }
    setRowState((curr) => [
      ...curr.slice(0, rowIndex),
      {
        ...curr[rowIndex],
        cuttingErrors: { ...curr[rowIndex].cuttingErrors, [index]: false },
        cutting: [
          ...curr[rowIndex].cutting.slice(0, index),
          {
            qty: curr[rowIndex].cutting[index].qty,
            size: isNaN(size) ? 0 : size,
          },
          ...curr[rowIndex].cutting.slice(index + 1),
        ],
      },
      ...curr.slice(rowIndex + 1),
    ]);
  }

  function renderVariant(
    item: DropdownOption<{ Price: number; SizeType?: string }>,
  ) {
    return (
      <div
        className={`px-9 py-2  cursor-pointer ${
          item.id !== size ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="text-primary font-semibold mb-1">{item.label}</div>
        <div className="text-on-surface">
          ${item.extraData?.Price}
          {item.extraData?.SizeType &&
            item.extraData.SizeType === "Length" &&
            " per l/m"}
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
            ? `$${item.extraData!.minPrice}`
            : `$${item.extraData!.minPrice}-$${item.extraData!.maxPrice}}`}
        </div>
      </div>
    );
  }

  function renderColour(
    item: DropdownOption<{ Code: string; Price: number; SecCode?: string }>,
  ) {
    return (
      <div
        className={`flex items-center px-9 py-4 cursor-pointer justify-between ${
          item.id !== variant?.id ? "bg-on-primary" : "bg-surface"
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
        <div className="text-on-surface">${item.extraData!.Price}</div>
      </div>
    );
  }

  const sizeOptions = Object.entries(variantSizesMap).map(
    ([sizeId, { size, price, sizeType }]) => ({
      label: size,
      id: sizeId,
      extraData: {
        Price: price,
        SizeType: sizeType,
      },
    }),
  );

  const colourRangeOptions = size
    ? Object.entries(variantSizesMap[size].ranges).map(
        ([catId, { categoryName, minPrice, maxPrice }]) => ({
          id: catId,
          label: categoryName,
          extraData: {
            minPrice,
            maxPrice,
          },
        }),
      )
    : [];

  const colourOptions = range
    ? variantSizesMap[size as string].ranges[range].colours.map((col) => ({
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
    <div
      className={`py-4 pl-4 pr-2.5 border-b border-b-surface ${
        fade ? "opacity-30" : ""
      }`}
    >
      <div className="flex justify-between  gap-x-4 ">
        <div className="font-bold">
          {addOn
            ? `${addOn.itemName} ${addOn.name}`
            : `${item.accessoryItem.Branch_Item.Item_Name} ${
                item.accessoryVariant?.Variant_Size || ""
              }`}
        </div>
        <div>
          <button
            className={`p-2.5 font-semibold rounded-[20px] flex gap-x-1 items-center focus:outline-none ${
              expanded ? "bg-primary text-on-primary" : "bg-surface"
            }`}
            onClick={toggleExpanded}
          >
            <span>Configure</span>
            <FaCaretDown className={expanded ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
      {addOn && (
        <div className="mt-2.5">
          <div className="flex justify-between gap-x-4">
            <div className="font-bold text-on-surface">
              {addOn.colour || "Unpainted"}
            </div>
            <div className="font-semibold">{getItemPrice(addOn)}</div>
          </div>
          <div className="mt-2.5 flex justify-between items-end">
            <div className="flex gap-x-4 items-center">
              <div className="font-bold text-on-surface">Qty:</div>
              {addOn.type === "standard" ? (
                <div className="font-medium">{addOn.qty}</div>
              ) : (
                <div className="text-xs font-medium">
                  {addOn.cuttingList.map((record, index) => (
                    <div key={index.toString()}>
                      {record.qty} x {record.size}
                      {addOn.unit}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              role="button"
              className="font-bold text-xs cursor-pointer"
              onClick={onRemove}
            >
              Remove
            </div>
          </div>
        </div>
      )}
      {expanded && (
        <>
          <div className="mt-4 mb-2.5 font-bold">Variant</div>
          <Dropdown<{ Price: number; SizeType?: string }>
            value={size || ""}
            onChange={(newSize) => {
              setRowState((curr) => {
                const newRowState: AddOnRowState = {
                  ...curr[rowIndex],
                  size: newSize,
                  range: "",
                  variant: undefined,
                };
                const record = variantSizesMap[newSize];
                const ranges = Object.keys(record.ranges);
                if (ranges.length === 1) {
                  newRowState.range = ranges[0];
                }
                const colours =
                  variantSizesMap[newSize].ranges[ranges[0]].colours;
                if (colours.length === 1) {
                  newRowState.variant = colours[0];
                }
                return [
                  ...curr.slice(0, rowIndex),
                  newRowState,
                  ...curr.slice(rowIndex + 1),
                ];
              });
            }}
            placeholder="Select Variant"
            options={sizeOptions}
            renderItem={renderVariant}
            disabled={sizeOptions.length === 1}
          />
          {colourRangeOptions.length > 1 && (
            <>
              <div className="mt-4 mb-2.5 font-bold">Choose Colour Range</div>
              <Dropdown<{ minPrice: number; maxPrice: number }>
                value={range || ""}
                onChange={(newRange) => {
                  setRowState((curr) => {
                    const newRowState: AddOnRowState = {
                      ...curr[rowIndex],
                      range: newRange,
                      variant: undefined,
                    };
                    const colours =
                      variantSizesMap[size as string].ranges[newRange].colours;
                    if (colours.length === 1) {
                      newRowState.variant = colours[0];
                    }
                    return [
                      ...curr.slice(0, rowIndex),
                      newRowState,
                      ...curr.slice(rowIndex + 1),
                    ];
                  });
                }}
                placeholder="Select Colour Range"
                options={colourRangeOptions}
                renderItem={renderCategory}
              />
            </>
          )}
          {colourOptions.length > 1 && (
            <>
              <div className="mt-4 mb-2.5 font-bold">Choose Colour</div>
              <Dropdown<{ Code: string; Price: number; SecCode?: string }>
                value={variant?.id || ""}
                onChange={(newValue) => {
                  setRowState((curr) => {
                    const newRowState = { ...curr[rowIndex] };
                    const record = colourOptions.find(
                      (item) => item.id === newValue,
                    );
                    newRowState.variant = {
                      id: record!.id,
                      Colour_Name: record!.label,
                      Colour_Code: record!.extraData.Code,
                      price: record!.extraData.Price,
                      Secondary_Colour_Code: record!.extraData.SecCode,
                      CustomMeasure: record!.extraData.CustomMeasure,
                      CustomMeasureUnit: record!.extraData.CustomMeasureUnit,
                      CustomMaxSize: record!.extraData.CustomMaxSize,
                      CustomMinSize: record!.extraData.CustomMinSize,
                      Variant_Size: record!.extraData!.VariantSize,
                      stockLengths: record!.extraData!.stockLengths,
                    };
                    return [
                      ...curr.slice(0, rowIndex),
                      newRowState,
                      ...curr.slice(rowIndex + 1),
                    ];
                  });
                }}
                placeholder="Select Colour"
                options={colourOptions}
                renderItem={renderColour}
              />
            </>
          )}
          {variant && (
            <AddOnQty
              variant={variant}
              qty={qty as number}
              onQtyChange={(newQty: number) =>
                setRowState((curr) => {
                  const newRowState = { ...curr[rowIndex] };
                  newRowState.qty = newQty;
                  return [
                    ...curr.slice(0, rowIndex),
                    newRowState,
                    ...curr.slice(rowIndex + 1),
                  ];
                })
              }
              cuttingList={cutting as Array<{ qty: number; size: number }>}
              errorMessage={
                Object.values(cuttingErrors as {}).filter(Boolean).length > 0
                  ? `Size should be between ${variant.CustomMinSize} and ${variant.CustomMaxSize}`
                  : ""
              }
              cuttingErrors={cuttingErrors as {}}
              changeItemQty={(index, newQty) =>
                setRowState((curr) => {
                  const newRowState = { ...curr[rowIndex] };
                  if (newQty === 0) {
                    newRowState.cutting = [
                      ...newRowState.cutting.slice(0, index),
                      ...newRowState.cutting.slice(index + 1),
                    ];
                  } else {
                    newRowState.cutting = [
                      ...newRowState.cutting.slice(0, index),
                      { qty: newQty, size: newRowState.cutting[index].size },
                      ...newRowState.cutting.slice(index + 1),
                    ];
                  }
                  return [
                    ...curr.slice(0, rowIndex),
                    newRowState,
                    ...curr.slice(rowIndex + 1),
                  ];
                })
              }
              changeItemSize={changeItemSize}
              addNewSize={() =>
                setRowState((curr) => {
                  const newRowState = {
                    ...curr[rowIndex],
                    cutting: [...curr[rowIndex].cutting, { qty: 1, size: 0 }],
                  };
                  return [
                    ...curr.slice(0, rowIndex),
                    newRowState,
                    ...curr.slice(rowIndex + 1),
                  ];
                })
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function AddOnQty({
  variant,
  qty,
  onQtyChange,
  addNewSize,
  cuttingErrors,
  changeItemSize,
  changeItemQty,
  cuttingList,
  errorMessage,
}: AddOnQtyProps) {
  return variant.CustomMeasure ? (
    <>
      {Object.keys(cuttingErrors).length > 0 && (
        <div className="mt-4 text-on-error">{errorMessage}</div>
      )}
      <div className="-mx-5 px-5">
        <table className={`w-full border-collapse table-fixed `}>
          <colgroup>
            <col className="w-4/12" />
            <col className="w-1/12" />
            <col className="w-4/12" />
            <col className="w-3/12" />
          </colgroup>
          <thead
            className={`sticky bg-white top-0 ${
              Object.keys(cuttingErrors).length > 0
                ? "[&_th]:pt-2"
                : "[&_th]:pt-4"
            } [&_th]:pb-2`}
          >
            <tr className="[&>th]:font-bold [&>th]:text-2xl">
              <th align="left">Quantity</th>
              <th></th>
              <th align="left">Size</th>
              <th align="left">Total</th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)>td]:pb-4">
            {cuttingList.map((item, index) => {
              const stockSize =
                variant.stockLengths &&
                variant.stockLengths.length > 0 &&
                item.size > 0 &&
                variant.stockLengths.find(
                  (record, index) =>
                    record.size >= item.size ||
                    index === variant.stockLengths!.length - 1,
                );
              const divisionFactor =
                variant.CustomMeasureUnit === "MM"
                  ? 1000
                  : variant.CustomMeasureUnit === "CM"
                  ? 100
                  : 1;
              return (
                <React.Fragment key={index.toString()}>
                  <tr>
                    <td align="left" valign="middle">
                      <div className="max-w-32">
                        <Range
                          value={item.qty}
                          onChange={(newQty: number) =>
                            changeItemQty(index, newQty)
                          }
                          noValidate
                          fullWidth
                        />
                      </div>
                    </td>
                    <td valign="middle">
                      <RiCloseLine className="text-on-surface-variant" />
                    </td>
                    <td align="left" valign="middle">
                      <TextInput
                        value={item.size > 0 ? item.size.toString() : ""}
                        onChange={(newSize) => changeItemSize(index, newSize)}
                        placeholder={variant.CustomMeasureUnit}
                        rootClasses={`w-[90px] max-w-[90px] ${
                          cuttingErrors[index] ? "outline outline-on-error" : ""
                        }`}
                        inputMode="numeric"
                      />
                    </td>
                    <td align="left" valign="middle">
                      <div className="font-medium text-on-surface">
                        $
                        {stockSize
                          ? (item.qty * stockSize.price).toFixed(2)
                          : (
                              (item.qty * item.size * variant.price) /
                              divisionFactor
                            ).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                  {stockSize && (
                    <tr>
                      <td />
                      <td />
                      <td colSpan={2}>
                        <span className="text-[10px] sm:text-xs">
                          Stock Length: ${stockSize.price.toFixed(2)} p/
                          {stockSize.size}
                          {variant.CustomMeasureUnit}
                        </span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center">
        <SecondaryButton text="Add New Size" onClick={addNewSize} />
      </div>
    </>
  ) : (
    <>
      <div className="my-4 font-bold text-xl">Quantity</div>
      <AutoComplete
        value={qty.toString()}
        onChange={(newQty) => {
          const qty = parseInt(newQty);
          if (isNaN(qty) || qty <= 0) {
            return;
          }
          onQtyChange(qty);
        }}
        id={`quantity-${variant.id}`}
        inputMode="numeric"
        buttonClassName="px-4"
      />
    </>
  );
}
