import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "..";
import { mergeItems } from "@/lib/utils";
import { BranchDetails, PricingDetails } from "@/types/supplier-form";

type CartItem =
  | {
      product: string;
      variant: string;
      qty: number;
      price: number;
      colour?: string;
      type: "standard";
      name: string;
      itemName: string;
    }
  | {
      product: string;
      variant: string;
      price: number;
      cuttingList: Array<{ qty: number; size: number }>;
      colour?: string;
      type: "custom";
      name: string;
      unit: string;
      minSize: number;
      maxSize: number;
      itemName: string;
      stockLengths?: Array<{ size: number; price: number }>;
    };

export type AppState = {
  token?: string;
  cart: Array<CartItem>;
  checkout: {
    // type: "Delivery" | "Pick-Up";
    address?: string;
    location?: string;
    // date: string;
  };
  successOrderId?: string;
  productSearchHistory: Array<string>;
  supplierCheckouts: Array<{
    supplierId: string;
    type: "Delivery" | "Pick-Up" | "Pova-Pickup";
    date: string;
  }>;
  supplierForm?: {
    branches: Array<BranchDetails>;
    deliveryPricing: PricingDetails;
  };
  jobRef?: string;
};

const appSlice = createSlice({
  name: "app",
  initialState: {
    cart: [],
    checkout: {},
    productSearchHistory: [],
    supplierCheckouts: [],
  } as AppState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.product === action.payload.product &&
          item.variant === action.payload.variant,
      );
      if (existingItemIndex >= 0) {
        mergeItems(state, existingItemIndex, action.payload);
      } else {
        state.cart.push(action.payload);
      }
    },
    replaceItemInCart: (
      state,
      action: PayloadAction<{ item: CartItem; index: number }>,
    ) => {
      const existingItemIndex = state.cart.findIndex(
        (item, index) =>
          item.product === action.payload.item.product &&
          item.variant === action.payload.item.variant &&
          index !== action.payload.index,
      );
      if (existingItemIndex >= 0) {
        state.cart.splice(action.payload.index, 1);
        mergeItems(state, existingItemIndex, action.payload.item);
      } else {
        state.cart[action.payload.index] = action.payload.item;
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart.splice(action.payload, 1);
    },
    updateCartItemQty: (
      state,
      action: PayloadAction<{ index: number; qty: number }>,
    ) => {
      const cartItem = state.cart[action.payload.index];
      if (cartItem.type === "standard") {
        cartItem.qty = action.payload.qty;
      }
    },
    updateCuttingList: (
      state,
      action: PayloadAction<{
        index: number;
        newList: Array<{ qty: number; size: number }>;
      }>,
    ) => {
      const cartItem = state.cart[action.payload.index];
      if (cartItem.type === "custom") {
        cartItem.cuttingList = action.payload.newList;
      }
    },
    setCart: (state, action: PayloadAction<Array<CartItem>>) => {
      state.cart = action.payload;
    },
    // setCheckoutType: (state, action: PayloadAction<"Delivery" | "Pick-Up">) => {
    //   state.checkout.type = action.payload;
    //   if (state.supplierCheckouts.length) {
    //     state.supplierCheckouts.forEach((checkout) => {
    //       checkout.type = action.payload;
    //     });
    //   }
    // },
    setCheckoutDetails: (
      state,
      action: PayloadAction<{ location: string; address?: string }>,
    ) => {
      state.checkout.location = action.payload.location;
      state.checkout.address = action.payload.address;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.successOrderId = action.payload;
    },
    // setOrderDate: (state, action: PayloadAction<string>) => {
    //   state.checkout.date = action.payload;
    // },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const existing = state.productSearchHistory.some(
        (item) => item === action.payload,
      );
      if (!existing) {
        state.productSearchHistory.push(action.payload);
        if (state.productSearchHistory.length > 3) {
          state.productSearchHistory.splice(0, 1);
        }
      }
    },
    bulkMergeSupplierCheckouts: (
      state,
      action: PayloadAction<
        Array<{
          supplierId: string;
          availableDates: string[];
          deliveryAvailable: boolean;
          pickupAvailable: boolean;
        }>
      >,
    ) => {
      const prevDetails = state.supplierCheckouts.reduce<{
        [key: string]: AppState["supplierCheckouts"][0];
      }>((acc, curr) => {
        acc[curr.supplierId] = curr;
        return acc;
      }, {} as any);
      state.supplierCheckouts = action.payload.map((record) => {
        const existing = prevDetails[record.supplierId];
        if (!existing) {
          return {
            supplierId: record.supplierId,
            date: record.availableDates[0],
            type: record.deliveryAvailable
              ? "Delivery"
              : record.pickupAvailable
              ? "Pick-Up"
              : "Pova-Pickup",
          };
        } else {
          const existingTypeSupported =
            (existing.type === "Delivery" && record.deliveryAvailable) ||
            (existing.type === "Pick-Up" && record.pickupAvailable);
          let newType = existingTypeSupported ? existing.type : undefined;

          if (!newType) {
            if (record.deliveryAvailable) {
              newType = "Delivery";
            } else if (record.pickupAvailable) {
              newType = "Pick-Up";
            } else {
              newType = "Pova-Pickup";
            }
          }

          return {
            supplierId: record.supplierId,
            type: newType,
            date: record.availableDates.includes(existing.date)
              ? existing.date
              : record.availableDates[0],
          };
        }
      });
    },
    resetSupplierCheckouts: (state) => {
      state.supplierCheckouts = [];
    },
    updateSupplierDelivery: (
      state,
      action: PayloadAction<{
        supplierId: string;
        date?: string;
        type?: "Pick-Up" | "Delivery";
      }>,
    ) => {
      const supplierRecord = state.supplierCheckouts.find(
        (item) => item.supplierId === action.payload.supplierId,
      );
      if (action.payload.date) {
        supplierRecord!.date = action.payload.date;
      }
      if (action.payload.type) {
        supplierRecord!.type = action.payload.type;
      }
    },
    setSupplierForm: (
      state,
      action: PayloadAction<{
        branches: Array<BranchDetails>;
        deliveryPricing: PricingDetails;
      }>,
    ) => {
      state.supplierForm = action.payload;
    },
    setJobRef: (state, action: PayloadAction<string | undefined>) => {
      state.jobRef = action.payload;
    },
    resetState: () =>
      ({
        cart: [],
        checkout: { date: "ASAP" },
        productSearchHistory: [],
        supplierCheckouts: [],
        jobRef: "",
      }) as any,
  },
});

export const {
  setToken,
  addItemToCart,
  removeFromCart,
  updateCartItemQty,
  // setCheckoutType,
  setCheckoutDetails,
  updateCuttingList,
  setCart,
  setOrderId,
  replaceItemInCart,
  // setOrderDate,
  addToSearchHistory,
  bulkMergeSupplierCheckouts,
  updateSupplierDelivery,
  resetSupplierCheckouts,
  setSupplierForm,
  setJobRef,
} = appSlice.actions;
export const selectToken = (state: RootState) => state.app.token;
export const selectCart = (state: RootState) => state.app.cart;
export const selectCheckout = (state: RootState) => state.app.checkout;
export const selectOrderId = (state: RootState) => state.app.successOrderId;
export const selectSearchHistory = (state: RootState) =>
  state.app.productSearchHistory;
export const selectSupplierCheckouts = (state: RootState) =>
  state.app.supplierCheckouts;
export const selectSupplierForm = (state: RootState) => state.app.supplierForm;
export const selectJobRef = (state: RootState) => state.app.jobRef;

export default appSlice.reducer;
