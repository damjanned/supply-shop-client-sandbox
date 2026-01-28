import { Variant } from "./product";

interface OrderCartStandardItem {
  item: string;
  variant: string;
  qty: number;
}

interface OrderCartCustomItem {
  item: string;
  variant: string;
  cuttingList: Array<{ qty: number; size: number }>;
}

type OrderCartElement = OrderCartStandardItem | OrderCartCustomItem;

export type OrderCart = OrderCartElement[];

interface OrderCartStandardItemResponse extends OrderCartStandardItem {
  itemPrice: number;
  variantObject: Variant;
}

interface OrderCartCustomItemResponse extends OrderCartCustomItem {
  itemPrice: number;
  cuttingList: Array<{
    qty: number;
    size: number;
    price: number;
    stockLength?: number;
  }>;
  variantObject: Variant;
}

export type OrderCartResponse = Array<
  OrderCartStandardItemResponse | OrderCartCustomItemResponse
>;

/** Used in verifyCart Items */
interface OrderCartFlashingItem {
  flashingVariant: string;
  cuttingList: Array<{ qty: number; size: number }>;
  bends: number;
  girth: number;
  tapered: boolean;
  id: string;
}

interface OrderCartFlashingItemResponse extends OrderCartFlashingItem {
  itemPrice: number;
  cuttingList: Array<{ qty: number; size: number; price: number }>;
}

export type FlashingOrderCart = OrderCartFlashingItem[];
export type FlashingOrderCartResponse = OrderCartFlashingItemResponse[];

/** Used to place order */
interface FlashingOrderElement extends OrderCartFlashingItem {
  diagram: string;
  image: string;
}

export type FlashingOrder = FlashingOrderElement[];
