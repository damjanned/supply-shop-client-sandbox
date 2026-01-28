import Loader from "@/components/Loader";
import Snackbar from "../SnackbarContainer";
import useQuery from "@/hooks/useQuery";
import {
  addItemToCart,
  AppState,
  selectCart,
  selectCheckout,
} from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Product } from "@/types/product";
import { useParams, useSearchParams } from "next/navigation";
import MultipleVariant from "../MultiVariant/index";
import ProductSummary from "../ProductSummary";
import SingleVariant from "../SingleVariant";
import React from "react";
import { getAllItemsPrice } from "@/lib/utils";

export type AddOnData = AppState["cart"][0] & {
  size: string;
  range: string;
  colourCode: string;
  secColourCode?: string;
  product: string;
  clientId: string;
};

export type AddOnItem = {
  accessoryItem: Product;
  accessoryVariant?: Product["Branch_Item_Variants"][0];
  notionalMatch: boolean;
};

export type VariantSizeMap = {
  [key: string]: {
    size: string;
    sizeType?: string;
    price: number;
    ranges: {
      [key: string]: {
        categoryName: string;
        minPrice: number;
        maxPrice: number;
        colours: Array<{
          Colour_Name: string;
          Colour_Code: string;
          Secondary_Colour_Code?: string;
          id: string;
          price: number;
          CustomMeasure: boolean;
          CustomMeasureUnit?: string;
          CustomMinSize?: number;
          CustomMaxSize?: number;
          Variant_Size: string;
          stockLengths?: Array<{ size: number; price: number }>;
        }>;
      };
    };
  };
};

export type AddOnRowState = {
  size: string;
  range: string;
  variant?: VariantSizeMap[""]["ranges"][""]["colours"][0];
  qty: number;
  cutting: Array<{ qty: number; size: number }>;
  cuttingErrors: { [key: number]: boolean };
  product: string;
  itemName: string;
};

export default function ProductDetails() {
  const params = useParams();
  const query = useSearchParams();
  const from = query.get("f") as any;
  const edit = query.get("edit") as string;
  const checkout = useAppSelector(selectCheckout);
  const dispatch = useAppDispatch();
  const { loading, error, data } = useQuery<{ data: Product }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getOneItemByLocation?location=${checkout.location}&itemID=${params.id}`,
  );
  const cart = useAppSelector(selectCart);
  const cartItem = edit ? cart[parseInt(edit)] : undefined;
  const [addOns, setAddOns] = React.useState<Array<AddOnData>>([]);

  function addAddOnsToCart() {
    addOns.forEach((addOn) => {
      let item: AppState["cart"][0];
      if (addOn.type === "standard") {
        item = {
          product: addOn.product,
          variant: addOn.variant,
          qty: addOn.qty,
          price: addOn.price,
          colour: addOn.colour,
          type: "standard",
          name: addOn.name,
          itemName: addOn.itemName,
        };
      } else {
        item = {
          product: addOn.product,
          variant: addOn.variant,
          price: addOn.price,
          cuttingList:
            addOn.cuttingList.length > 0 &&
            addOn.cuttingList[addOn.cuttingList.length - 1].size === 0
              ? addOn.cuttingList.slice(0, addOn.cuttingList.length - 1)
              : addOn.cuttingList,
          colour: addOn.colour,
          type: "custom",
          name: addOn.name,
          unit: addOn.unit,
          minSize: addOn.minSize,
          maxSize: addOn.maxSize,
          itemName: addOn.itemName,
          stockLengths: addOn.stockLengths,
        };
      }
      dispatch(addItemToCart(item));
    });
  }

  function addAddOn(addOn: AddOnData) {
    setAddOns((curr) => [...curr, addOn]);
  }
  function updateAddOn(updatedAddOn: AddOnData, index: number) {
    setAddOns((curr) => [
      ...curr.slice(0, index),
      updatedAddOn,
      ...curr.slice(index + 1),
    ]);
  }
  function removeAddOn(index: number) {
    setAddOns((curr) => [...curr.slice(0, index), ...curr.slice(index + 1)]);
  }

  const addOnPrice = getAllItemsPrice(addOns, false);

  return error ? (
    <div className="w-full h-[calc(100vh-129px)]  !h-[calc(100svh-129px)] flex justify-center items-center">
      <div>Something went wrong</div>
    </div>
  ) : loading ? (
    <div className="w-full h-[calc(100vh-129px)] !h-[calc(100svh-129px)] flex justify-center items-center">
      <Loader size={100} />
    </div>
  ) : (
    <div className="relative h-[calc(100vh-61px)] !h-[calc(100svh-61px)] -mx-5">
      {data!.data!.Branch_Item_Variants.length == 1 ? (
        <SingleVariant
          product={data!.data as Product}
          snackbar={Snackbar}
          cartItem={cartItem}
          cartItemIndex={edit ? parseInt(edit) : undefined}
          addOnsPrice={addOnPrice}
          addAddOnsToCart={addAddOnsToCart}
          addOns={addOns}
          addAddOn={addAddOn}
          updateAddOn={updateAddOn}
          removeAddOn={removeAddOn}
        >
          <ProductSummary product={data!.data as Product} from={from} />
        </SingleVariant>
      ) : (
        <MultipleVariant
          product={data!.data as Product}
          snackbar={Snackbar}
          cartItem={cartItem}
          cartItemIndex={edit ? parseInt(edit) : undefined}
          addOnsPrice={addOnPrice}
          addAddOnsToCart={addAddOnsToCart}
          addOns={addOns}
          addAddOn={addAddOn}
          updateAddOn={updateAddOn}
          removeAddOn={removeAddOn}
          resetAddOns={() => setAddOns([])}
        >
          <ProductSummary product={data!.data as Product} from={from} />
        </MultipleVariant>
      )}
    </div>
  );
}
