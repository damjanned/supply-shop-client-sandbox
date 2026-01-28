import Radio from "@/components/Radio";
import {
  selectCart,
  selectSupplierCheckouts,
  updateSupplierDelivery,
} from "@/redux/app";
import { selectFlashingCart } from "@/redux/flashings";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";
import React from "react";
import { FaCaretDown } from "react-icons/fa6";
import Datepicker from "react-tailwindcss-datepicker";

function findMissingDateRanges(
  availableDates: string[],
): Array<{ startDate: Date; endDate: Date }> {
  const ranges: Array<{ startDate: Date; endDate: Date }> = [];
  if (!availableDates.length) return ranges;

  const dates = availableDates.sort();
  let startDate = dayjs(dates[0]);
  const endDate = dayjs(dates[dates.length - 1]);
  const availableDateSet = new Set(dates);

  let rangeStart: string | null = null;
  let current = startDate;

  while (!current.isAfter(endDate)) {
    const currentStr = current.format("YYYY-MM-DD");

    if (!availableDateSet.has(currentStr)) {
      if (!rangeStart) {
        rangeStart = currentStr;
      }
    } else if (rangeStart) {
      const prevDate = current.subtract(1, "day");
      const rangeEndStr = prevDate.format("YYYY-MM-DD");
      if (rangeStart === rangeEndStr) {
        ranges.push({
          startDate: new Date(rangeEndStr),
          endDate: new Date(rangeEndStr),
        });
      } else {
        ranges.push({
          startDate: new Date(rangeStart),
          endDate: new Date(rangeEndStr),
        });
      }
      rangeStart = null;
    }

    current = current.add(1, "day");
  }

  // Handle the case where the last range extends to the end
  if (rangeStart) {
    const rangeEndStr = endDate.format("YYYY-MM-DD");
    if (rangeStart === rangeEndStr) {
      ranges.push({
        startDate: new Date(rangeEndStr),
        endDate: new Date(rangeEndStr),
      });
    } else {
      ranges.push({
        startDate: new Date(rangeStart),
        endDate: new Date(rangeEndStr),
      });
    }
  }

  return ranges;
}

type Props = {
  supplierProducts: Array<{
    branchName: string;
    supplierName: string;
    items: Array<{ itemId: string }>;
    flashings: Array<{ clientID: string }>;
    supplierId: string;
    availableDates: string[];
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    pickUpAddress?: string;
    povaPickUp: boolean;
    povaPickUpCharge?: boolean;
    povaPickupAddress?: string;
  }>;
  showAddress: (address: string) => void;
};

type RowProps = {
  sp: Props["supplierProducts"][0];
  dispatch: ReturnType<typeof useAppDispatch>;
  checkoutRecord?: ReturnType<typeof selectSupplierCheckouts>[0];
  onRadioChange: React.ChangeEventHandler<HTMLInputElement>;
  cart: ReturnType<typeof selectCart>;
  flashingCart: ReturnType<typeof selectFlashingCart>;
  showAddress: (address: string) => void;
};

export default function DeliverySelector({
  supplierProducts,
  showAddress,
}: Props) {
  const checkouts = useAppSelector(selectSupplierCheckouts);
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);

  return (
    <div className="border-t-2 border-t-surface -mx-5 pb-20">
      {supplierProducts.map((sp) => {
        const checkoutRecord = checkouts.find(
          (record) => record.supplierId === sp.supplierId,
        );
        function onRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
          dispatch(
            updateSupplierDelivery({
              supplierId: sp.supplierId,
              type: e.target.value as any,
            }),
          );
        }
        return (
          <SupplierDelivery
            sp={sp}
            checkoutRecord={checkoutRecord}
            onRadioChange={onRadioChange}
            dispatch={dispatch}
            cart={cart}
            key={sp.supplierName}
            flashingCart={flashingCart}
            showAddress={showAddress}
          />
        );
      })}
    </div>
  );
}

function SupplierDelivery({
  sp,
  checkoutRecord,
  onRadioChange,
  dispatch,
  cart,
  flashingCart,
  showAddress,
}: RowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const itemIds = sp.items.reduce<{ [key: string]: true }>((acc, curr) => {
    if (!acc[curr.itemId]) {
      acc[curr.itemId] = true;
    }
    return acc;
  }, {});
  const flashingIds = sp.flashings.reduce<{ [key: string]: true }>(
    (acc, curr) => {
      if (!acc[curr.clientID]) {
        acc[curr.clientID] = true;
      }
      return acc;
    },
    {},
  );
  const supplierItems = cart.filter((item) => itemIds[item.product]);
  const supplierFlashings = flashingCart.reduce<
    Array<RowProps["flashingCart"][0] & { index: number }>
  >((acc, f, index) => {
    if (flashingIds[f.id]) {
      acc.push({ ...f, index });
    }
    return acc;
  }, []);

  return (
    <div className="border-b border-b-surface py-4 px-5">
      <div
        className="flex justify-between"
        onClick={() => setExpanded((curr) => !curr)}
      >
        <div className="text-xl font-bold shrink">{`${sp.supplierName} ${sp.branchName}`}</div>
        <button
          className={`p-2.5 font-semibold rounded-[20px] flex gap-x-1 justify-center items-center focus:outline-none text-sm basis-28 shrink-0 self-start ${
            expanded ? "bg-primary text-on-primary" : "bg-surface"
          }`}
        >
          <span>{expanded ? "Hide" : "See Items"}</span>
          <FaCaretDown className={expanded ? "rotate-180" : ""} />
        </button>
      </div>
      <div className="my-4 space-y-4">
        <div className="flex justify-between items-center gap-x-4">
          <Radio
            checked={checkoutRecord?.type === "Pick-Up" || false}
            onChange={onRadioChange}
            id={`option-pickup-${sp.supplierId}`}
            label="Pick-Up"
            labelContainerClases="text-on-surface"
            value="Pick-Up"
            disabled={!sp.pickupAvailable}
          />
          {sp.pickUpAddress && (
            <span
              role="button"
              className="text-xs font-semibold cursor-pointer"
              onClick={() => showAddress(sp.pickUpAddress as string)}
            >
              View Details
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Radio
            checked={checkoutRecord?.type === "Pova-Pickup" || false}
            onChange={onRadioChange}
            id={`option-pova-${sp.supplierId}`}
            label={`Pick-Up from Pova ${
              sp.povaPickUpCharge === false ? "(free)" : ""
            }`}
            labelContainerClases="text-on-surface"
            value="Pova-Pickup"
            disabled={!sp.povaPickUp}
          />
          {sp.povaPickupAddress && (
            <span
              role="button"
              className="text-xs font-semibold cursor-pointer"
              onClick={() => showAddress(sp.povaPickupAddress as string)}
            >
              View Details
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Radio
            checked={checkoutRecord?.type === "Delivery" || false}
            onChange={onRadioChange}
            id={`option-delivery-${sp.supplierId}`}
            label="Delivery"
            labelContainerClases="text-on-surface"
            value="Delivery"
            disabled={!sp.deliveryAvailable}
          />
        </div>
      </div>
      <Datepicker
        value={
          checkoutRecord?.date
            ? {
                startDate: new Date(checkoutRecord.date),
                endDate: new Date(checkoutRecord.date),
              }
            : { startDate: new Date(), endDate: new Date() }
        }
        asSingle
        useRange={false}
        onChange={(value) => {
          if (!value?.startDate || !value?.endDate) {
            return;
          }
          dispatch(
            updateSupplierDelivery({
              supplierId: sp.supplierId,
              date: dayjs(value.startDate).format("YYYY-MM-DD"),
            }),
          );
        }}
        displayFormat="DD/MM/YYYY"
        readOnly
        inputClassName="py-3 border-0 bg-surface text-primary font-medium px-4 w-full rounded-lg focus:outline-none"
        containerClassName="relative [&>button]:text-primary md:w-[400px] [&_button.text-blue-500]:text-primary [&_button.text-blue-500]:font-bold  [&_button.bg-blue-500]:bg-primary [&_button.bg-blue-500]:text-on-primary"
        popoverDirection="down"
        placeholder="Select Date"
        minDate={new Date(sp.availableDates[0])}
        maxDate={new Date(sp.availableDates[sp.availableDates.length - 1])}
        disabledDates={findMissingDateRanges(sp.availableDates)}
      />
      {expanded && (
        <div className="-mx-5 px-5 mt-2 pt-4 border-t-2 border-t-surface space-y-4">
          {supplierItems.map((item) => (
            <div
              key={`${item.product}-${item.variant}`}
              className="flex justify-between"
            >
              <div className="shrink">
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
              <div className="shrink">
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
      )}
    </div>
  );
}
