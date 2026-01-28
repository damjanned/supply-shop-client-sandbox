import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { ColourDirection } from "@/app/flashings/components/Draw/utils";

type FlashingCartItem = {
  diagram: string;
  image: string;
  colour: {
    name: string;
    code: string;
    id: string;
  };
  cuttingList: Array<{ qty: number; size: number; price: number }>;
  bends: number;
  girth: number;
  category: string;
  colourDir: ColourDirection;
  tapered: boolean;
  id: string;
};

export type FlashingState = {
  current?: {
    diagram?: string;
    image?: string;
    colour?: string;
    category?: string;
    cuttingList?: Array<{ qty: number; size: number; price: number }>;
    colourDir?: ColourDirection;
    tapered?: boolean;
  };
  cart: FlashingCartItem[];
  tutorialShown: boolean;
};

const flashingSlice = createSlice({
  name: "flashing",
  initialState: { cart: [], tutorialShown: false } as FlashingState,
  reducers: {
    setCurrentFlashing: (
      state,
      action: PayloadAction<Partial<FlashingState["current"]>>,
    ) => {
      state.current = { ...(state.current || {}), ...action.payload };
    },
    removeCurrentFlashing: (state) => {
      state.current = undefined;
    },
    addFlashingItemToCart: (
      state,
      action: PayloadAction<Omit<FlashingCartItem, "id">>,
    ) => {
      state.cart.push({ ...action.payload, id: Date.now().toString() });
    },
    removeFlashingItemFromCart: (state, action: PayloadAction<string>) => {
      const index = state.cart.findIndex((item) => item.id === action.payload);
      if (index >= 0) {
        state.cart.splice(index, 1);
      }
    },
    updateFlashingItem: (
      state,
      action: PayloadAction<{ id: string; item: Omit<FlashingCartItem, "id"> }>,
    ) => {
      const index = state.cart.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index >= 0) {
        state.cart[index] = { ...action.payload.item, id: action.payload.id };
      }
    },
    setTutorial: (state, action: PayloadAction<boolean>) => {
      state.tutorialShown = action.payload;
    },
    setCache: (
      state,
      action: PayloadAction<{ key: string; duration: number; data: any }>,
    ) => {
      const path = action.payload.key.split("/");
      let finalData: any = state;
      for (let i = 0; i < path.length - 1; i++) {
        finalData = finalData[path[i]];
      }
      finalData[path[path.length - 1]] = {
        data: action.payload.data,
        expiresAt: Date.now() + action.payload.duration * 1000,
      };
    },
    setFlashingCart: (state, action: PayloadAction<FlashingCartItem[]>) => {
      state.cart = action.payload;
    },
  },
});

export const {
  setCurrentFlashing,
  removeCurrentFlashing,
  updateFlashingItem,
  addFlashingItemToCart,
  setTutorial,
  setCache,
  removeFlashingItemFromCart,
  setFlashingCart,
} = flashingSlice.actions;

export const selectCurrent = (state: RootState) => state.flashing.current;

export const selectDiagram = (state: RootState) =>
  state.flashing.current?.diagram;

export const selectFlashingCart = (state: RootState) => state.flashing.cart;

export const selectTutorial = (state: RootState) =>
  state.flashing.tutorialShown;

export const selectColourDir = (state: RootState) =>
  state.flashing.current?.colourDir;
export const selectTapered = (state: RootState) =>
  state.flashing.current?.tapered;

export const selectCache = (key: string) => {
  return function (state: RootState) {
    const path = key.split("/");
    let finalData: any = state;
    for (let i = 0; i < path.length; i++) {
      finalData = finalData[path[i]];
    }
    return finalData && Date.now() <= finalData.expiresAt
      ? finalData.data
      : null;
  };
};

export default flashingSlice.reducer;
