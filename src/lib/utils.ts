import { AppState } from "@/redux/app";
import { FlashingState } from "@/redux/flashings";
import { InvoiceStatus, Order } from "@/types/order";
import {
  FlashingOrderCartResponse,
  OrderCartResponse,
} from "@/types/order-cart";

export function formatPrice(price: number) {
  if (Intl?.NumberFormat !== undefined) {
    const formatter = new Intl.NumberFormat(undefined, {
      currency: "AUD",
      style: "currency",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return formatter.format(price);
  } else {
    return price.toLocaleString(undefined, {
      currency: "AUD",
      style: "currency",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
}

export function compareCarts(
  oldCart: AppState["cart"],
  newCart: OrderCartResponse,
): [boolean, Array<AppState["cart"][0] | undefined>] {
  const updatedCart: Array<AppState["cart"][0] | undefined> = [];
  let isSame = true;
  const idToCartItem = newCart.reduce<{ [key: string]: OrderCartResponse[0] }>(
    (acc, curr) => {
      const id = `${curr.item},${curr.variant}`;
      acc[id] = curr;
      return acc;
    },
    {},
  );
  oldCart.forEach((item) => {
    const id = `${item.product},${item.variant}`;
    const record = idToCartItem[id];
    if (!record) {
      updatedCart.push(undefined);
      isSame = false;
    } else {
      if (item.type === "custom" && item.stockLengths?.length) {
        updatedCart.push({
          ...item,
          stockLengths: record.variantObject.Variant_Stock_Lengths!.map(
            (sl) => ({
              size: sl.Length,
              price: sl.Selling_Price,
            }),
          ),
        });
        const prevItemPrice = item.cuttingList.reduce((acc, curr) => {
          const cuttingStockLength = item.stockLengths!.find(
            (length) => length.size >= curr.size,
          );
          const currPrice = cuttingStockLength!.price * curr.qty;
          return acc + currPrice;
        }, 0);
        const newPrice = parseFloat(record.itemPrice.toFixed(2));
        const parsedPrice = parseFloat(prevItemPrice.toFixed(2));
        if (newPrice !== parsedPrice) {
          isSame = false;
        }
      } else {
        let price;
        if (item.type === "standard") {
          price = parseFloat(
            (record.itemPrice / (record as any).qty).toFixed(2),
          );
        } else {
          const unitPrice =
            (record as any).cuttingList[0].price /
            (record as any).cuttingList[0].qty;
          let divisionFactor = 1;
          if (item.unit === "MM") {
            divisionFactor = 1000;
          } else if (item.unit === "CM") {
            divisionFactor = 100;
          }
          price = parseFloat(
            (
              (unitPrice * divisionFactor) /
              (record as any).cuttingList[0].size
            ).toFixed(2),
          );
        }
        const parsedItemPrice = parseFloat(item.price.toFixed(2));
        if (price !== parsedItemPrice) {
          isSame = false;
          updatedCart.push({ ...item, price });
        } else {
          updatedCart.push({ ...item });
        }
      }
    }
  });
  return [isSame, updatedCart];
}

export function comparedFlashingCarts(
  oldCart: FlashingState["cart"],
  newCart: FlashingOrderCartResponse,
): [boolean, Array<FlashingState["cart"][0] | undefined>] {
  const updatedCart: Array<FlashingState["cart"][0] | undefined> = [];
  let isSame = true;
  const idToCartItem = newCart.reduce<{
    [key: string]: FlashingOrderCartResponse[0];
  }>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});
  oldCart.forEach((item) => {
    const id = item.id;
    const record = idToCartItem[id];
    if (!record) {
      updatedCart.push(undefined);
      isSame = false;
    } else {
      const prevPrice = item.cuttingList.reduce(
        (acc, curr) => acc + curr.price,
        0,
      );
      const parsedPrevPrice = parseFloat(prevPrice.toFixed(2));
      const parsedPrice = parseFloat(record.itemPrice.toFixed(2));
      if (parsedPrice !== parsedPrevPrice) {
        isSame = false;
      }
      updatedCart.push({ ...item, cuttingList: record.cuttingList });
    }
  });
  return [isSame, updatedCart];
}

export function mergeItems(
  state: AppState,
  index: number,
  newItem: AppState["cart"][0],
) {
  const cartItem = state.cart[index];
  if (cartItem.type === "standard" && newItem.type === "standard") {
    cartItem.qty += newItem.qty;
  } else if (cartItem.type === "custom" && newItem.type === "custom") {
    const sizeToQty = cartItem.cuttingList.reduce<{
      [key: string]: number;
    }>((acc, curr) => {
      acc[curr.size.toString()] = curr.qty;
      return acc;
    }, {});
    newItem.cuttingList.forEach((entry) => {
      if (!sizeToQty[entry.size.toString()]) {
        sizeToQty[entry.size.toString()] = 0;
      }
      sizeToQty[entry.size.toString()] += entry.qty;
    });
    cartItem.cuttingList = Object.entries(sizeToQty).map(([size, qty]) => ({
      size: parseInt(size),
      qty,
    }));
  }
}

export function getFlashingPrice(flashing: {
  cuttingList: FlashingState["cart"][0]["cuttingList"];
}) {
  return formatPrice(
    flashing.cuttingList.reduce((acc, curr) => acc + curr.price, 0),
  ).slice(1);
}

export function getAllFlashingsPriceAndShapes(
  flashingCart: FlashingState["cart"],
  format: true,
): [number, string];
export function getAllFlashingsPriceAndShapes(
  flashingCart: FlashingState["cart"],
  format: false,
): [number, number];
export function getAllFlashingsPriceAndShapes(
  flashingCart: FlashingState["cart"],
  format = true,
) {
  let shapes = 0;
  let fCost = 0;

  flashingCart.forEach((flashing) => {
    flashing.cuttingList.forEach((record) => {
      shapes += record.qty;
      fCost += record.price;
    });
  });

  return [shapes, format ? formatPrice(fCost).slice(1) : fCost];
}

export function getItemPrice(
  item:
    | {
        qty: number;
        price: number;
        type: "standard";
      }
    | {
        cuttingList: Array<{ qty: number; size: number }>;
        type: "custom";
        price: number;
        unit: string;
        stockLengths?: Array<{ size: number; price: number }>;
      },
) {
  if (item.type === "custom") {
    return formatPrice(
      item.cuttingList.reduce(
        (acc, curr) => {
          let itemCost;
          if (item.stockLengths?.length) {
            itemCost = curr.size
              ? curr.qty *
                item.stockLengths.find(
                  (record, index) =>
                    record.size >= curr.size ||
                    index === item.stockLengths!.length - 1,
                )!.price
              : 0;
          } else {
            itemCost =
              (curr.qty * curr.size * item.price) /
              (item.unit === "MM" ? 1000 : item.unit === "CM" ? 100 : 1);
          }
          return acc + itemCost;
        },

        0,
      ),
    ).slice(1);
  } else {
    return formatPrice(item.qty * item.price).slice(1);
  }
}

export function getAllItemsPrice(cart: AppState["cart"], format?: true): string;
export function getAllItemsPrice(
  cart: AppState["cart"],
  format?: false,
): number;
export function getAllItemsPrice(cart: AppState["cart"], format = true) {
  const price = cart.reduce((acc, curr) => {
    let price;
    if (curr.type === "standard") {
      price = curr.qty * curr.price;
    } else {
      let divisionFactor = 1;
      if (curr.unit === "MM") {
        divisionFactor = 1000;
      } else if (curr.unit === "CM") {
        divisionFactor = 100;
      }
      price = curr.cuttingList.reduce((_acc, _curr) => {
        let itemCost;
        if (curr.stockLengths?.length) {
          itemCost = _curr.size
            ? _curr.qty *
              curr.stockLengths.find(
                (record, index) =>
                  record.size >= _curr.size ||
                  index === curr.stockLengths!.length - 1,
              )!.price
            : 0;
        } else {
          itemCost = (_curr.qty * _curr.size * curr.price) / divisionFactor;
        }
        return _acc + itemCost;
      }, 0);
    }
    return acc + price;
  }, 0);
  return format ? formatPrice(price).slice(1) : price;
}

export const BLUR_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABlJREFUKFNjvHPnzn8GIgDjqEJ8oUT94AEALK8jyZYh+3oAAAAASUVORK5CYII=";

export const googleMapLibs = ["drawing", "places"];

export function getOrderStatus(order: Order) {
  const invoice = order.Order_Invoice;
  if (
    invoice.Invoice_Status === "Settled" ||
    invoice.Invoice_Status === "Refund Processed"
  ) {
    switch (order.Order_Status) {
      case "Completed":
        return { status: order.Order_Status, className: "text-success" };
      case "Suppliers Confirmed":
        return { status: order.Order_Status, className: "text-success" };
      default:
        return { status: order.Order_Status, className: "text-primary" };
    }
  } else if (invoice.Invoice_Status === "Partially Paid") {
    return {
      status: InvoiceStatus[invoice.Invoice_Status],
      className: "text-error",
    };
  } else {
    return {
      status: InvoiceStatus[invoice.Invoice_Status],
      className: "text-primary",
    };
  }
}
