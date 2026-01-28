import React from "react";
import { FaCaretDown } from "react-icons/fa6";

interface CartItem {
  product: string;
  variant: string;
  itemName: string;
  name: string;
  colour?: string;
}

interface StandardCartItem extends CartItem {
  type: "standard";
  qty: number;
}

interface CustomCartItem extends CartItem {
  type: "custom";
  cuttingList: Array<{ qty: number; size: number }>;
  unit: string;
}

type Props = {
  record: {
    items: string[];
    flashings: string[];
    supplierName: string;
    cost: number;
    reasoning: string[];
  };
  cart: Array<StandardCartItem | CustomCartItem>;
  flashingCart: Array<{
    id: string;
    girth: number;
    bends: number;
    tapered: boolean;
    colour: { name: string };
    cuttingList: Array<{ qty: number; size: number }>;
  }>;
  supplierCheckout: {
    type: "Delivery" | "Pick-Up" | "Pova-Pickup";
    date: string;
  };
};

export function SupplierDelivery({
  flashingCart,
  record,
  supplierCheckout,
  cart,
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState(false);

  const supplierItems = cart.filter((item) =>
    record.items.includes(item.product),
  );
  const supplierFlashings = flashingCart.reduce<
    Array<Props["flashingCart"][0] & { index: number }>
  >((acc, f, index) => {
    if (record.flashings.includes(f.id)) {
      acc.push({ ...f, index });
    }
    return acc;
  }, []);

  return (
    <div className="border border-surface rounded-pova-lg">
      <div
        className="flex justify-between px-3 py-2 items-center"
        onClick={() => setExpanded((curr) => !curr)}
      >
        <div className="text-sm font-semibold shrink">
          <div>
            {supplierCheckout.type}-{record.supplierName}
          </div>
          <div className="text-xs mt-2.5">
            <span className=" text-on-surface-variant font-normal">
              Estimated {supplierCheckout.type}:
            </span>
            &nbsp;
            <span className="font-semibold text-success">
              {supplierCheckout.date.split("-").reverse().join("/")}
            </span>{" "}
          </div>
        </div>
        <button
          className={`p-2.5 font-semibold rounded-[20px] flex gap-x-1 justify-center items-center focus:outline-none text-sm basis-28 shrink-0 self-start ${
            expanded ? "bg-primary text-on-primary" : "bg-surface"
          }`}
        >
          <span>
            {expanded
              ? "Hide"
              : `(${supplierItems.length + supplierFlashings.length}) Items`}
          </span>
          <FaCaretDown className={expanded ? "rotate-180" : ""} />
        </button>
      </div>
      {expanded && (
        <>
          <div className="px-3 py-2.5 border-t border-t-surface space-y-4">
            {supplierItems.map((item) => (
              <div
                key={`${item.product}-${item.variant}`}
                className="flex justify-between"
              >
                <div className="shrink text-sm">
                  <div className="font-semibold">
                    {item.itemName} {item.name}
                  </div>
                  <div className="font-medium text-on-surface">
                    {item.colour || "Unpainted"}
                  </div>
                </div>
                <div className="basis-24 shrink-0 text-right">
                  {item.type === "standard" ? (
                    <span className="inline-block bg-surface py-2 px-4 font-semibold rounded-pova-lg">
                      {item.qty}
                    </span>
                  ) : (
                    <>
                      {item.cuttingList.map((rc, index) => (
                        <div
                          key={index.toString()}
                          className="font-medium text-xs"
                        >
                          {rc.qty} X {rc.size}
                          {item.unit}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
            {supplierFlashings.map((flashing) => (
              <div key={flashing.id} className="flex justify-between">
                <div className="shrink text-sm">
                  <div className="font-semibold">
                    Flashing #{flashing.index + 1} - Girth:{flashing.girth}
                    MM&nbsp;Bends:{flashing.bends}
                    {flashing.tapered && <div>Tapered</div>}
                  </div>
                  <div className="font-medium text-on-surface">
                    {flashing.colour.name || "Unpainted"}
                  </div>
                </div>
                <div className="basis-24 shrink-0 text-right">
                  {flashing.cuttingList.map((rc, index) => (
                    <div key={index.toString()} className="font-medium text-xs">
                      {rc.qty} X {rc.size}mm
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {record.cost > 0 && (
            <div
              className={`px-3 space-y-2.5 py-2.5 border-t-2 border-t-surface ${
                reasonOpen ? "bg-surface" : ""
              }`}
              onClick={() => setReasonOpen((curr) => !curr)}
            >
              <div className=" flex justify-between items-center text-sm font-semibold ">
                <div>Delivery Cost: ${record.cost.toFixed(2)}</div>
                <div
                  className="flex gap-x-1 items-center cursor-pointer"
                  role="button"
                >
                  <span>Price Guide</span>
                  <FaCaretDown className={reasonOpen ? "rotate-180" : ""} />
                </div>
              </div>
              {reasonOpen && (
                <ul className="list-disc list-inside">
                  {record.reasoning.map((r, index) => (
                    <li key={index.toString()} className="text-[0.5rem]">
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
