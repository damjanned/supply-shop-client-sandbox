import {
  addItemToCart,
  replaceItemInCart,
  selectCart,
  selectCheckout,
  type AppState,
} from "@/redux/app";
import type { Product } from "@/types/product";
import React from "react";
import type {
  AddOnData,
  AddOnItem,
  AddOnRowState,
  VariantSizeMap,
} from "../ProductDetails";
import Stepper from "@/components/Stepper";
import VariantSelector from "./variant-selector";
import Controll from "@/components/Controls";
import { useRouter } from "next/navigation";
import ColorSelector from "./color-selector";
import QuantitySelector from "./quantity-selector";
import useLazyQuery from "@/hooks/useLazyQuery";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { formatPrice } from "@/lib/utils";
import { selectFlashingCart } from "@/redux/flashings";
import JobRef from "@/components/JobRef";

type Props = {
  children: React.ReactNode;
  product: Product;
  snackbar: React.ComponentType<{
    text: string;
    onClick: () => void;
  }>;
  cartItem?: AppState["cart"][0];
  cartItemIndex?: number;
  addOnsPrice: number;
  addAddOnsToCart: () => void;
  addOns: Array<AddOnData>;
  addAddOn: (addOn: AddOnData) => void;
  updateAddOn: (updatedAddOn: AddOnData, index: number) => void;
  removeAddOn: (index: number) => void;
  resetAddOns: () => void;
};

export type SelectedState = {
  size?: string;
  range?: string;
  variant?: {
    Colour_Name: string;
    Colour_Code: string;
    Secondary_Colour_Code?: string;
    price: number;
    id: string;
    CustomMeasure: boolean;
    CustomMeasureUnit?: string;
    CustomMinSize?: number;
    CustomMaxSize?: number;
    Variant_Size: string;
    stockLengths?: Array<{
      size: number;
      price: number;
    }>;
  };
  qty?: number;
  cuttingList: Array<{ qty: number; size: number }>;
};

export default function MultipleVariant({
  product,
  cartItem,
  children,
  resetAddOns,
  addOns,
  addAddOn,
  updateAddOn,
  snackbar: Snackbar,
  cartItemIndex,
  addOnsPrice,
  addAddOnsToCart,
  removeAddOn,
}: Props) {
  const variantSizeMap = product.Branch_Item_Variants.reduce((acc, curr) => {
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
    acc[sizeId].price = Math.min(curr.Variant_Selling_Price, acc[sizeId].price);
    acc[sizeId].ranges[category].minPrice = Math.min(
      acc[sizeId].ranges[category].minPrice,
      curr.Variant_Selling_Price,
    );
    acc[sizeId].ranges[category].maxPrice = Math.min(
      acc[sizeId].ranges[category].maxPrice,
      curr.Variant_Selling_Price,
    );
    return acc;
  }, {} as VariantSizeMap);
  const checkout = useAppSelector(selectCheckout);
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const [showJobRef, setSetShowJobRef] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [selected, setSelected] = React.useState<SelectedState>(() => {
    if (cartItem) {
      const variant = product.Branch_Item_Variants.find(
        (record) => record.Variant_ID === cartItem.variant,
      );
      return {
        size: variant!.Variant_Size_ID,
        range: variant!.Variant_Colour?.Colour_Category?._id || "Unpainted",
        variant: {
          Colour_Name: variant!.Variant_Colour?.Colour_Name || "Unpainted",
          Colour_Code: variant!.Variant_Colour?.Colour_Code || "",
          Secondary_Colour_Code:
            variant!.Variant_Colour?.Secondary_Colour_Code || "",
          price: variant!.Variant_Selling_Price,
          id: variant!.Variant_ID,
          CustomMeasure: variant!.Variant_Size_Type === "Non Standard",
          CustomMeasureUnit: variant!.Variant_Size_Type_Units,
          CustomMinSize: variant!.Variant_Size_Min,
          CustomMaxSize: variant!.Variant_Size_Max,
          Variant_Size: variant!.Variant_Size,
          stockLengths: variant!.Variant_Stock_Lengths?.map((record) => ({
            size: record.Length,
            price: record.Selling_Price,
          })),
        },
        qty: cartItem.type === "custom" ? undefined : cartItem.qty,
        cuttingList: cartItem.type === "custom" ? cartItem.cuttingList : [],
      };
    } else {
      const sizes = Object.entries(variantSizeMap);
      const returnValue = { cuttingList: [], qty: 1 } as SelectedState;
      if (sizes.length === 1) {
        returnValue.size = sizes[0][0];
        const ranges = Object.entries(sizes[0][1].ranges);
        if (ranges.length === 1) {
          returnValue.range = ranges[0][0];
          const colours = ranges[0][1].colours;
          if (colours.length === 1) {
            returnValue.variant = colours[0];
          }
        }
      }
      return returnValue;
    }
  });
  const [rowStates, setRowStates] = React.useState<Array<AddOnRowState>>([]);
  const lastFetchVariant: React.MutableRefObject<string | null> =
    React.useRef<string>(null);
  const [executor, { data: accessoriesData, loading }] = useLazyQuery<{
    data: Array<AddOnItem>;
  }>("", {
    onComplete: setInitialRowStates,
  });
  const [cuttingErrors, setCuttingErrors] = React.useState<{
    [key: number]: boolean;
  }>({});
  const dispatch = useAppDispatch();

  function setInitialRowStates(data?: { data: Array<AddOnItem> }) {
    if (data) {
      const states: Array<AddOnRowState> = [];
      data.data.forEach((item) => {
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
            const category =
              curr.Variant_Colour?.Colour_Category?._id || "Unpainted";
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
              Secondary_Colour_Code:
                curr.Variant_Colour?.Secondary_Colour_Code || "",
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
        if (item.accessoryVariant) {
          let range;
          const size = item.accessoryVariant.Variant_Size_ID;
          let variant;
          if (!item.notionalMatch) {
            range =
              item.accessoryVariant.Variant_Colour?.Colour_Category?._id ||
              "Unpainted";
            variant = {
              price: item.accessoryVariant.Variant_Selling_Price,
              Colour_Name:
                item.accessoryVariant.Variant_Colour?.Colour_Name ||
                "Unpainted",
              Colour_Code:
                item.accessoryVariant.Variant_Colour?.Colour_Code || "",
              Secondary_Colour_Code:
                item.accessoryVariant.Variant_Colour?.Secondary_Colour_Code,
              id: item.accessoryVariant.Variant_ID,
              CustomMeasure:
                item.accessoryVariant.Variant_Size_Type === "Non Standard",
              CustomMeasureUnit: item.accessoryVariant.Variant_Size_Type_Units,
              CustomMinSize: item.accessoryVariant.Variant_Size_Min,
              CustomMaxSize: item.accessoryVariant.Variant_Size_Max,
              Variant_Size: item.accessoryVariant.Variant_Size,
              stockLengths: item.accessoryVariant.Variant_Stock_Lengths?.map(
                (record) => ({
                  size: record.Length,
                  price: record.Selling_Price,
                }),
              ),
            };
          } else {
            const record = variantSizesMap[size];
            const ranges = Object.keys(record.ranges);
            if (ranges.length === 1) {
              range = ranges[0];
              const colours = variantSizesMap[size].ranges[ranges[0]].colours;
              if (colours.length === 1) {
                variant = colours[0];
              }
            } else {
              range = "";
            }
          }
          states.push({
            qty: 1,
            cutting: [],
            cuttingErrors: {},
            size,
            range,
            variant,
            product: item.accessoryItem.Branch_Item.Item_ID,
            itemName: item.accessoryItem.Branch_Item.Item_Name,
          });
        } else {
          const sizes = Object.entries(variantSizesMap);
          if (sizes.length === 1) {
            const ranges = Object.entries(sizes[0][1].ranges);
            if (ranges.length === 1) {
              const colours = ranges[0][1].colours;
              if (colours.length === 1) {
                states.push({
                  qty: 1,
                  cutting: [],
                  cuttingErrors: {},
                  size: sizes[0][0],
                  range: ranges[0][0],
                  product: item.accessoryItem.Branch_Item.Item_ID,
                  itemName: item.accessoryItem.Branch_Item.Item_Name,
                  variant: colours[0],
                });
              } else {
                states.push({
                  qty: 1,
                  cutting: [],
                  cuttingErrors: {},
                  size: sizes[0][0],
                  range: ranges[0][0],
                  product: item.accessoryItem.Branch_Item.Item_ID,
                  itemName: item.accessoryItem.Branch_Item.Item_Name,
                });
              }
            } else {
              states.push({
                qty: 1,
                cutting: [],
                cuttingErrors: {},
                size: sizes[0][0],
                range: "",
                product: item.accessoryItem.Branch_Item.Item_ID,
                itemName: item.accessoryItem.Branch_Item.Item_Name,
              });
            }
          } else {
            states.push({
              qty: 1,
              cutting: [],
              cuttingErrors: {},
              size: "",
              range: "",
              product: item.accessoryItem.Branch_Item.Item_ID,
              itemName: item.accessoryItem.Branch_Item.Item_Name,
            });
          }
        }
      });
      setRowStates(states);
    }
  }

  const router = useRouter();

  function changeVariant(newSize: string) {
    setSelected((curr) => {
      const newSelected = {
        ...curr,
        size: newSize,
        range: undefined,
        variant: undefined,
      } as SelectedState;
      const record = variantSizeMap[newSize];
      const ranges = Object.keys(record.ranges);
      if (ranges.length === 1) {
        newSelected.range = ranges[0];
        const colours = variantSizeMap[newSize].ranges[ranges[0]].colours;
        if (colours.length === 1) {
          newSelected.variant = colours[0];
        }
      }
      return newSelected;
    });
  }

  function changeRange(newRange: string) {
    setSelected((curr) => {
      const newSelected = { ...curr, range: newRange } as SelectedState;
      const colours =
        variantSizeMap[curr.size as string].ranges[newRange].colours;
      if (colours.length === 1) {
        newSelected.variant = colours[0];
      }
      return newSelected;
    });
  }

  function changeColour(newColour: string) {
    setSelected((curr) => {
      const colours =
        variantSizeMap[curr.size as string].ranges[curr.range as string]
          .colours;
      const colour = colours.find((obj) => obj.id === newColour);
      return {
        ...curr,
        variant: colour,
      };
    });
  }

  function leftControlClick() {
    if (step === 1) {
      router.back();
    } else {
      setStep((curr) => curr - 1);
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }

  function rightControlClick() {
    let nextStep = 3;
    if (step === 1) {
      const record = variantSizeMap[selected.size as string];
      const ranges = Object.values(record.ranges);
      if (ranges.length > 1) {
        nextStep = 2;
      } else {
        const colours = Object.values(ranges[0].colours);
        if (colours.length > 1) {
          nextStep = 2;
        } else {
          setSelected((curr) => ({ ...curr, qty: 1 }));
        }
      }
    }
    setStep(nextStep);
    if (nextStep === 3 && selected.variant!.id !== lastFetchVariant.current) {
      executor(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/accessories/getForVariantByLocation/${selected.variant!.id}/${
          checkout.location
        }`,
      );
      lastFetchVariant.current = selected.variant!.id;
      resetAddOns();
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }

  function moveToStep(newStep: number) {
    if (newStep === 1) {
      setStep(newStep);
    } else if (newStep === 2 && selected.size) {
      const record = variantSizeMap[selected.size as string];
      const ranges = Object.entries(record.ranges);
      if (ranges.length === 1) {
        setSelected((curr) => {
          const newSelected = { ...curr, range: ranges[0][0] };
          const colours = ranges[0][1].colours;
          if (colours.length === 1) {
            newSelected.variant = colours[0];
          }
          return newSelected;
        });
      }
      setStep(newStep);
    } else if (newStep === 3 && selected.variant) {
      if (selected.variant!.id !== lastFetchVariant.current) {
        executor(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/api/accessories/getForVariantByLocation/${selected.variant!.id}/${
            checkout.location
          }`,
        );
        lastFetchVariant.current = selected.variant!.id;
        resetAddOns();
      }
      setStep(3);
    }
  }

  function removeError(index: number) {
    setCuttingErrors((curr) => {
      const newErrors = { ...curr };
      delete newErrors[index];
      return newErrors;
    });
  }

  function addItem() {
    setSelected((curr) => ({
      ...curr,
      cuttingList: [...curr.cuttingList, { qty: 1, size: 0 }],
    }));
  }

  function updateItem(index: number, updated: { qty: number; size: number }) {
    if (updated.qty === 0) {
      setSelected((curr) => ({
        ...curr,
        cuttingList: [
          ...curr.cuttingList.slice(0, index),
          ...curr.cuttingList.slice(index + 1),
        ],
      }));
    } else {
      setSelected((curr) => ({
        ...curr,
        cuttingList: [
          ...curr.cuttingList.slice(0, index),
          updated,
          ...curr.cuttingList.slice(index + 1),
        ],
      }));
    }
  }

  function createItemPayload() {
    const isNonStandard = selected.variant!.CustomMeasure;
    const payload: any = {
      product: product.Branch_Item.Item_ID,
      itemName: product.Branch_Item.Item_Name,
      variant: selected.variant!.id,
      qty: !isNonStandard ? selected.qty : undefined,
      cuttingList: !isNonStandard
        ? undefined
        : selected.cuttingList.length > 0 &&
          selected.cuttingList[selected.cuttingList.length - 1].size === 0
        ? selected.cuttingList.slice(0, selected.cuttingList.length - 1)
        : selected.cuttingList,
      type: !isNonStandard ? "standard" : "custom",
      name: selected.variant!.Variant_Size,
      unit: selected.variant!.CustomMeasureUnit,
      maxSize: selected.variant!.CustomMaxSize,
      minSize: selected.variant!.CustomMinSize,
      price: selected.variant!.price,
      stockLengths: selected.variant!.stockLengths,
      colour: selected.variant!.Colour_Name,
    };
    return payload;
  }

  function addToCart() {
    if (selected.variant!.CustomMeasure) {
      if (selected.cuttingList.length === 0) {
        alert("Please add at least one cut for the item");
        return;
      } else {
        const last = selected.cuttingList[selected.cuttingList.length - 1];
        const list = [...selected.cuttingList];
        if (last.size === 0) {
          list.splice(list.length - 1, 1);
        }
        const errors = list.reduce<Array<number>>((acc, curr, index) => {
          if (
            curr.size > (selected.variant!.CustomMaxSize as number) ||
            curr.size < (selected.variant!.CustomMinSize as number)
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
          setCuttingErrors(errorIndexes);
          return;
        }
      }
    } else if (selected.qty === 0) {
      alert("Item quantity needs to be at least 1");
      return;
    }
    const payload = createItemPayload();
    const jobRef = cart.length === 0 && flashingCart.length === 0;
    dispatch(
      cartItemIndex !== undefined
        ? replaceItemInCart({ item: payload, index: cartItemIndex })
        : addItemToCart(payload),
    );
    if (addOnsPrice > 0) {
      addAddOnsToCart();
    }
    // if first item show option for job reference
    if (jobRef) {
      setSetShowJobRef(true);
    } else {
      router.back();
    }
  }

  let content: React.ReactNode, cost;
  let rightActive = false;
  switch (step) {
    case 1:
      content = (
        <VariantSelector
          variants={Object.entries(variantSizeMap).map(([id, data]) => ({
            id,
            label: data.size,
            extraData: {
              Price: data.price,
              SizeType: data.sizeType,
            },
          }))}
          value={selected.size}
          onChange={changeVariant}
        >
          {children}
        </VariantSelector>
      );
      rightActive = !!selected.size;
      break;
    case 2:
      content = (
        <ColorSelector
          recordObject={variantSizeMap[selected.size as string]}
          range={selected.range}
          colour={selected.variant?.id}
          onRangeChange={changeRange}
          onChange={changeColour}
        />
      );
      rightActive = !!selected.variant;
      break;
    case 3:
      let props: any = {
        colour: selected.variant!.Colour_Name || "Unpainted",
        name: variantSizeMap[selected.size as string].size,
        loading: cartItem ? false : loading,
        data: cartItem ? undefined : accessoriesData?.data,
        rowStates,
        setRowStates,
        addAddOn,
        updateAddOn,
        addOns,
        removeAddOn,
      };
      if (selected.variant!.CustomMeasure) {
        props = {
          ...props,
          cuttingList: selected.cuttingList,
          unit: selected.variant!.CustomMeasureUnit,
          type: "custom",
          price: selected.variant!.price,
          stockLengths: selected.variant!.stockLengths,
          cuttingErrors,
          removeError,
          errorMessage: `Size should be between ${
            selected.variant!.CustomMinSize
          } and ${selected.variant!.CustomMaxSize}`,
          addItem,
          updateItem,
        };
        let divisionFactor = 1;
        const unit = selected.variant!.CustomMeasureUnit;
        if (unit === "MM") {
          divisionFactor = 1000;
        } else if (unit === "CM") {
          divisionFactor = 100;
        }
        const stockLengths = selected.variant!.stockLengths;
        cost = selected.cuttingList.reduce<number>((acc, curr) => {
          let itemCost;
          if (stockLengths?.length) {
            itemCost = curr.size
              ? curr.qty *
                stockLengths.find(
                  (item, index) =>
                    item.size >= curr.size ||
                    index === stockLengths!.length - 1,
                )!.price
              : 0;
          } else {
            itemCost =
              (curr.qty * selected.variant!.price * curr.size) / divisionFactor;
          }
          return acc + itemCost;
        }, 0);
      } else {
        props = {
          ...props,
          qty: selected.qty,
          type: "standard",
          onQtyChange: (newQty: number) =>
            setSelected((curr) => ({
              ...curr,
              qty: newQty,
            })),
        };
        cost = (selected.qty as number) * selected.variant!.price;
      }
      content = <QuantitySelector {...props} />;
  }

  cost = cost !== undefined ? cost + addOnsPrice : cost;

  return (
    <>
      <Stepper
        step={step}
        onStepClick={moveToStep}
        steps={[
          "Variant",
          "Colour",
          selected.variant?.CustomMeasure ? "CuttingList" : "Quantity",
        ]}
      />
      <div className="pt-16 pb-36 overflow-y-auto max-md:no-scrollbar">
        {content}
      </div>
      <Controll left onClick={leftControlClick} />
      {step !== 3 && (
        <Controll onClick={rightControlClick} inactive={!rightActive} />
      )}
      {step === 3 && (cost as number) > 0 && (!loading || cartItem) && (
        <Snackbar
          text={formatPrice(cost as number).slice(1)}
          onClick={addToCart}
        />
      )}
      <JobRef visible={showJobRef} />
    </>
  );
}
