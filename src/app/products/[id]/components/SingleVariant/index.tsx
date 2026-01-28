"use client";
import { Product } from "@/types/product";
import React from "react";
import Range from "../../../../../components/Range";
import {
  AppState,
  addItemToCart,
  replaceItemInCart,
  selectCart,
  selectCheckout,
} from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import useQuery from "@/hooks/useQuery";
import type {
  AddOnData,
  AddOnItem,
  AddOnRowState,
  VariantSizeMap,
} from "../ProductDetails";
import Loader from "@/components/Loader";
import AddOns from "../Addons";
import JobRef from "@/components/JobRef";
import { selectFlashingCart } from "@/redux/flashings";

type Props = {
  product: Product;
  children: React.ReactNode;
  snackbar: React.ComponentType<{
    text: string;
    onClick: () => void;
  }>;
  cartItem?: AppState["cart"][0];
  cartItemIndex?: number;
  addOnsPrice: number;
  addOns: Array<AddOnData>;
  addAddOnsToCart: () => void;
  addAddOn: (addOn: AddOnData) => void;
  updateAddOn: (updatedAddOn: AddOnData, index: number) => void;
  removeAddOn: (index: number) => void;
};

export default function SingleVariant({
  product,
  children,
  cartItem,
  cartItemIndex,
  addOnsPrice,
  addAddOnsToCart,
  ...rest
}: Props) {
  const [rowStates, setRowStates] = React.useState<Array<AddOnRowState>>([]);
  const [qty, setQty] = React.useState((cartItem as any)?.qty || 1);
  const [showJobRef, setShowJobRef] = React.useState(false);
  const checkout = useAppSelector(selectCheckout);
  const router = useRouter();
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);

  const dispatch = useAppDispatch();

  const { loading, data } = useQuery<{
    data: Array<AddOnItem>;
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/accessories/getForVariantByLocation/${product.Branch_Item_Variants[0].Variant_ID}/${checkout.location}`,
  );

  React.useEffect(() => {
    if (data) {
      const states: Array<AddOnRowState> = [];
      data.data.forEach((item) => {
        if (item.accessoryVariant) {
          const variantSizesMap =
            item.accessoryItem.Branch_Item_Variants.reduce((acc, curr) => {
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
                    curr.Variant_Colour?.Colour_Category
                      ?.Colour_Category_Name || "Unpainted",
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
            }, {} as VariantSizeMap);
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
      });
      setRowStates(states);
    }
  }, [data]);

  return (
    <>
      <div className="h-[calc(100%-90px)]  overflow-y-auto max-md:no-scrollbar pb-16">
        {children}
        <div className="mt-6 pb-4 px-5">
          <Range value={qty} onChange={setQty} />
        </div>
        <>
          {cartItem ? null : loading ? (
            <div className="flex justify-center pt-12">
              <Loader size={30} />
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="border-t-surface border-t-[7px] py-4 text-xl font-bold border-b-surface border-b-[3px] px-5">
                Accessories (optional)
              </div>
              <AddOns
                rowStates={rowStates}
                setRowStates={setRowStates}
                data={data.data}
                addOns={rest.addOns}
                addAddOn={rest.addAddOn}
                updateAddOn={rest.updateAddOn}
                removeAddOn={rest.removeAddOn}
              />
            </>
          ) : null}
        </>
      </div>
      {(cartItem || !loading) && (
        <rest.snackbar
          text={formatPrice(
            product.Branch_Item_Variants[0].Variant_Selling_Price * qty +
              addOnsPrice,
          ).slice(1)}
          onClick={() => {
            const item = {
              product: product.Branch_Item.Item_ID,
              itemName: product.Branch_Item.Item_Name,
              variant: product.Branch_Item_Variants[0].Variant_ID,
              qty,
              price: product.Branch_Item_Variants[0].Variant_Selling_Price,
              type: "standard" as any,
              name: product.Branch_Item_Variants[0].Variant_Size,
            };
            const jobRef = cart.length === 0 && flashingCart.length === 0;
            dispatch(
              cartItemIndex !== undefined
                ? replaceItemInCart({ item, index: cartItemIndex })
                : addItemToCart(item),
            );
            if (addOnsPrice > 0) {
              addAddOnsToCart();
            }
            if (jobRef) {
              setShowJobRef(true);
            } else {
              router.back();
            }
          }}
        />
      )}
      <JobRef visible={showJobRef} />
    </>
  );
}
