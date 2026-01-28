import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import PageContainer from "@/components/PageContainer";
import {
  addFlashingItemToCart,
  removeCurrentFlashing,
  selectCurrent,
  selectFlashingCart,
  updateFlashingItem,
} from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import React from "react";
import Range from "@/components/Range";
import { RiCloseLine } from "react-icons/ri";
import TextInput from "@/components/TextInput";
import { useRouter, useSearchParams } from "next/navigation";
import { ColourDirection } from "../Draw/utils";
import { FlashingVariant } from "@/types/flashing";
import { selectCart } from "@/redux/app";
import JobRef from "@/components/JobRef";

type Props = {
  setStep: (step: number) => void;
  data?: Array<FlashingVariant>;
};

export default function Specification({ setStep, data }: Props) {
  const current = useAppSelector(selectCurrent);
  const diagram = current?.diagram;
  const [category, setCategory] = React.useState(current?.category || "");
  const [colour, setColour] = React.useState(current?.colour || "");
  const [cutting, setCutting] = React.useState<
    Array<{ qty: number; size: number }>
  >(current?.cuttingList || [{ qty: 1, size: 0 }]);
  const [cuttingErrors, setCuttingErrors] = React.useState<{
    [key: number]: boolean;
  }>({});
  const [showJobRef, setShowJobRef] = React.useState(false);
  const details = React.useMemo(() => {
    if (!diagram) {
      return {
        bends: 0,
        girth: 0,
      };
    }
    const flow = JSON.parse(diagram as string);
    const edges = flow.edges;
    return {
      bends:
        edges.length -
        1 +
        flow.nodes.reduce(
          (acc: number, curr: any) => acc + (curr.data.folded ? 2 : 0),
          0,
        ),
      girth: edges.reduce((acc: number, curr: any) => {
        let value = parseInt(curr.label as string);
        let tValue = curr.data?.taperedLabel
          ? parseInt(curr.data.taperedLabel)
          : 0;
        if (isNaN(value)) {
          value = 0;
        }
        if (isNaN(tValue)) {
          tValue = 0;
        }
        return acc + Math.max(value, tValue);
      }, 0),
      edgeCount: edges.length,
    };
  }, [diagram]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const query = useSearchParams();
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);

  function renderColour(item: DropdownOption<{ code: string }>) {
    return (
      <div
        className={`flex items-center px-5 md:px-9 py-4 cursor-pointer justify-between ${
          item.id !== colour ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="flex">
          <div
            className={`rounded-full w-6 h-6`}
            style={{ backgroundColor: `#${item.extraData!.code}` }}
          />
          <div className="text-xs md:text-sm font-semibold ml-2">
            {item.label}
          </div>
        </div>
      </div>
    );
  }

  function renderCategory(item: DropdownOption<undefined>) {
    return (
      <div
        className={`flex items-center px-6 md:px-9 py-4 cursor-pointer justify-between ${
          item.id !== category ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="text-xs md:text-sm font-semibold ml-2">
          {item.label}
        </div>
      </div>
    );
  }

  function changeItemQty(index: number, newQty: number) {
    if (newQty === 0) {
      setCutting((curr) => [...curr.slice(0, index), ...curr.slice(index + 1)]);
    } else {
      setCutting((curr) => [
        ...curr.slice(0, index),
        { ...curr[index], qty: newQty },
        ...curr.slice(index + 1),
      ]);
    }
  }

  function changeItemSize(index: number, newSize: string): void {
    const size = parseFloat(newSize);
    if (isNaN(size) && newSize !== "") {
      return;
    }
    setCutting((curr) => [
      ...curr.slice(0, index),
      {
        ...curr[index],
        size: isNaN(size) ? 0 : size,
      },
      ...curr.slice(index + 1),
    ]);
    setCuttingErrors((curr) => {
      const newErrors = { ...curr };
      delete newErrors[index];
      return newErrors;
    });
  }

  function addToCart() {
    const errors = cutting.reduce(
      (acc, curr, index) => {
        if (details.edgeCount === 1) {
          if (curr.size < 50 || curr.size > 2400) {
            acc[index] = true;
          }
        } else if (curr.size < 50 || curr.size > 8000) {
          acc[index] = true;
        }
        return acc;
      },
      {} as { [key: number]: boolean },
    );
    if (Object.keys(errors).length > 0) {
      setCuttingErrors(errors);
      return;
    } else {
      const id = query.get("edit");
      const colourObject = categoryOptions
        .find((item) => item.id === category)!
        .colours.find((col) => col.id === colour);
      const payload = {
        diagram: diagram as string,
        image: current!.image as string,
        cuttingList: cutting.map((record) => ({
          ...record,
          price:
            ((Math.max(record.size, 1000) * unitPrice) / 1000 + baseCost) *
            record.qty,
        })),
        ...details,
        colour: {
          name: colourObject!.label,
          code: colourObject!.extraData.code,
          id: colourObject!.id,
        },
        category,
        colourDir: current!.colourDir as ColourDirection,
        tapered: current!.tapered as boolean,
      };
      const jobRef = cart.length === 0 && flashingCart.length === 0;
      if (id) {
        dispatch(updateFlashingItem({ id, item: payload }));
      } else {
        dispatch(addFlashingItemToCart(payload));
      }
      dispatch(removeCurrentFlashing());
      if (jobRef) {
        setShowJobRef(true);
      } else {
        router.replace(query.get("next") || "/flashings/cart");
      }
    }
  }

  const categoryOptions = Object.values(
    data
      ? data.reduce<{
          [key: string]: {
            label: string;
            id: string;
            colours: Array<{
              label: string;
              id: string;
              extraData: {
                code: string;
                prices: FlashingVariant["Selling_Price_Array"];
              };
            }>;
          };
        }>((acc, curr) => {
          const category = curr.Colour.Colour_Category;
          if (!acc[category._id]) {
            acc[category._id] = {
              label: category.Colour_Category_Name,
              id: category._id,
              colours: [
                {
                  label: curr.Colour.Colour_Name,
                  id: curr.Colour._id,
                  extraData: {
                    code: curr.Colour.Colour_Code,
                    prices: curr.Selling_Price_Array,
                  },
                },
              ],
            };
          } else {
            acc[category._id].colours.push({
              label: curr.Colour.Colour_Name,
              id: curr.Colour._id,
              extraData: {
                code: curr.Colour.Colour_Code,
                prices: curr.Selling_Price_Array,
              },
            });
          }
          return acc;
        }, {} as any)
      : {},
  );

  let unitPrice: number;
  let baseCost = 0;

  categoryOptions.forEach((entry) => {
    if (entry.id === category) {
      const selectedPricing = entry.colours.find((item) => item.id === colour)
        ?.extraData?.prices;
      if (selectedPricing) {
        const index =
          details.bends <= selectedPricing.length
            ? (details.bends || 1) - 1
            : selectedPricing.length - 1;
        const priceArray = selectedPricing[index];
        for (let i = 0; i < priceArray.length; i++) {
          if (priceArray[i].Max_Girth >= details.girth) {
            unitPrice =
              current?.tapered && (priceArray[i] as any).Tapered_Selling_Price
                ? (priceArray[i] as any).Tapered_Selling_Price
                : priceArray[i].Selling_Price;
            baseCost =
              current?.tapered && (priceArray[i] as any).Tapered_Cost
                ? (priceArray[i] as any).Tapered_Cost
                : 0;
            break;
          }
        }
        if (details.bends > selectedPricing.length) {
          unitPrice += 1.65 * (details.bends - selectedPricing.length);
        }
      }
    }
  });

  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)] relative">
        {data ? (
          <>
            <div
              className="h-[calc(100vh-161px)] !h-[calc(100svh-161px)] overflow-y-auto max-md:no-scrollbar"
              ref={scrollRef}
            >
              <div className="flex gap-x-4 border-b-surface border-b-[3px] py-4">
                <div className="grow">
                  <div className="font-bold text-xl mb-4">
                    Choose Colour Range
                  </div>
                  <Dropdown<undefined>
                    value={category}
                    onChange={(newCat) => {
                      setCategory(newCat);
                    }}
                    placeholder="Select Colour Range"
                    options={categoryOptions}
                    renderItem={renderCategory}
                    small
                  />
                  {category && (
                    <>
                      <div className="my-4 font-bold text-xl">
                        Choose Colour
                      </div>
                      <Dropdown<{ code: string }>
                        value={colour}
                        onChange={(newColour) => {
                          setColour(newColour);
                        }}
                        placeholder="Select Colour"
                        options={
                          categoryOptions.find((item) => item.id === category)!
                            .colours
                        }
                        renderItem={renderColour}
                        small
                      />
                    </>
                  )}
                </div>
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current?.image}
                    alt="flashing preview"
                    className="self-start w-28 h-32 object-contain cursor-pointer"
                    onClick={() => setStep(1)}
                    width={650}
                    height={800}
                  />
                </div>
              </div>
              {colour && (
                <div>
                  <div className="mt-4 font-bold text-xl">
                    Create Cutting List
                  </div>
                  {Object.keys(cuttingErrors).length > 0 && (
                    <div className="mt-4 text-on-error">
                      {details.edgeCount === 1
                        ? "Length of flat sheet should be between 50mm and 2400mm"
                        : "Length of cutting should be between 50mm and 8000mm"}
                    </div>
                  )}
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
                    <tbody className="[&>tr:not(:last-child)>td]:pb-4 [&>tr:first-child>td]:pt-[2px]">
                      {cutting.map((item, index) => (
                        <tr key={index.toString()}>
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
                              onChange={(newSize) =>
                                changeItemSize(index, newSize)
                              }
                              placeholder="mm"
                              rootClasses={`w-[90px] max-w-[90px] ${
                                cuttingErrors[index]
                                  ? "outline outline-on-error"
                                  : ""
                              }`}
                              inputMode="numeric"
                            />
                          </td>
                          <td align="left" valign="middle">
                            <div className="font-medium text-on-surface">
                              $
                              {(
                                (((item.size > 0
                                  ? Math.max(item.size, 1000)
                                  : 0) *
                                  unitPrice) /
                                  1000 +
                                  (item.size > 0 ? baseCost : 0)) *
                                item.qty
                              ).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-center">
                    <SecondaryButton
                      text="Add New Size"
                      onClick={() => {
                        setCutting((curr) => [...curr, { qty: 1, size: 0 }]);
                        setTimeout(() => {
                          scrollRef.current?.scrollBy({
                            top: 150,
                          });
                        }, 0);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="fixed left-0 bottom-0 right-0 md:absolute md:-left-5 md:-right-5 bg-white shadow-pova-lg py-4 px-5 flex items-center gap-x-3">
              <SecondaryButton
                text="Edit Flashing"
                smallestRadius
                onClick={() => setStep(1)}
                fullWidth
                containerClasses="!p-4"
              />
              <PrimaryButton
                text={query.get("edit") ? "Update Cart" : "Add To Cart"}
                onClick={addToCart}
                disabled={
                  cutting.length === 0 || cutting.some((item) => item.size <= 0)
                }
                fullWidth
                shadow={false}
              />
            </div>
          </>
        ) : (
          <div className="h-full flex justify-center items-center">
            <div>Something went wrong</div>
          </div>
        )}
      </div>
      <JobRef
        visible={showJobRef}
        onSave={() => router.replace(query.get("next") || "/flashings/cart")}
      />
    </PageContainer>
  );
}
