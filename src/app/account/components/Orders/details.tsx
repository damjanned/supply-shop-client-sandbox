import { SecondaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import { SupplierDelivery } from "@/components/SupplierDelivery";
import useQuery from "@/hooks/useQuery";
import { formatPrice, getOrderStatus } from "@/lib/utils";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { Order } from "@/types/order";
import dayjs from "dayjs";
import Link from "next/link";
import { FaTruckMoving } from "react-icons/fa6";

type Props = {
  id: string;
};

export default function OrderDetails({ id }: Props) {
  const token = useAppSelector(selectToken);
  const { error, loading, data } = useQuery<{ data: Order }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user/getOne/${id}`,
    { token },
  );

  const date =
    data?.data?.Order_Date && dayjs(data.data.Order_Date).format("DD/MM/YYYY");
  const deliveryTypes =
    data?.data?.Order_Delivery_Calculation.supplierCheckouts.reduce(
      (acc, curr) => {
        if (curr.type === "Delivery") {
          acc[0]++;
        } else {
          acc[1]++;
        }
        return acc;
      },
      [0, 0],
    );

  const cart =
    data?.data?.Order_Items.map((item) => ({
      product: item.Item,
      variant: item.Variant,
      itemName: item.Branch_Item_Object.Branch_Item.Item_Name,
      name: item.Variant_Object.Variant_Size,
      colour: item.Variant_Object.Variant_Colour?.Colour_Name,
      type: (item.Variant_Object.Variant_Size_Type === "Standard"
        ? "standard"
        : "custom") as any,
      qty: item.Quantity,
      cuttingList: item.Cutting_List.map((r) => ({
        size: r.Size,
        qty: r.Quantity,
      })),
      unit: item.Variant_Object.Variant_Size_Type_Units,
    })) || [];
  const flashingCart = data?.data?.Order_Flashing_Items.map((f, index) => ({
    id: f.ClientID,
    girth: f.Total_Girth,
    bends: f.Total_Bends,
    tapered: f.Tapered,
    colour: {
      name: f.Flashing_Variant.Colour.Colour_Name,
    },
    cuttingList: f.Cutting_List.map((r) => ({
      qty: r.Quantity,
      size: r.Size,
    })),
  }));

  let status = "",
    className = "";

  if (data?.data) {
    const orderStatus = getOrderStatus(data.data);
    status = orderStatus.status;
    className = orderStatus.className;
  }

  return error ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
      <div>Something went wrong</div>
    </div>
  ) : loading ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
      <Loader size={100} />
    </div>
  ) : (
    <>
      <div className="flex justify-between items-center">
        <div className="text-pova-heading font-bold mt-4">
          #{data!.data.Order_Number}
        </div>
        <SecondaryButton text="View Orders" link="/account?t=2" />
      </div>
      <div className="mt-1">
        <div>
          <span className="text-on-surface-variant  font-medium">
            Status:&nbsp;
          </span>
          <span className={className}>{status}</span>
        </div>
        <div className="truncate">
          <span className="text-on-surface-variant  font-medium">
            Job Reference:&nbsp;
          </span>
          <span
            className="font-semibold"
            title={data!.data.Order_Job_Reference}
          >
            {data!.data.Order_Job_Reference || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-on-surface-variant font-medium">
            Order Date:&nbsp;
          </span>
          <span className="font-semibold">{date}</span>
        </div>
        <div>
          <span className="text-on-surface-variant font-medium">
            Delivery:&nbsp;
          </span>
          <span className="font-semibold">{deliveryTypes![0]}</span>
        </div>
        <div>
          <span className="text-on-surface-variant font-medium">
            Pick-Up:&nbsp;
          </span>
          <span className="font-semibold">{deliveryTypes![1]}</span>
        </div>
        <div className="truncate">
          <span className="text-on-surface-variant font-medium">
            Address:&nbsp;
          </span>
          <span
            className="font-semibold"
            title={data!.data.Order_Delivery_Calculation.deliveryAddress}
          >
            {data!.data.Order_Delivery_Calculation.deliveryAddress}
          </span>
        </div>
      </div>
      <div
        className={`-mx-5 overflow-y-auto max-md:no-scollbar ${
          data?.data.Order_Delivery_Calculation.totalDeliveryCost &&
          data.data.Order_Delivery_Calculation.totalDeliveryCost > 0
            ? "max-h-[calc(100vh-462px)] !max-h-[calc(100svh-462px)]"
            : "max-h-[calc(100vh-413px)] !max-h-[calc(100svh-413px)]"
        } space-y-3 pt-3 pb-16`}
      >
        {data!.data!.Order_Delivery_Calculation.deliveryCalculation.map(
          (supplierRecord) => {
            const record = {
              items: supplierRecord.items,
              flashings: supplierRecord.flashings,
              supplierName: supplierRecord.Supplier_Name,
              cost: supplierRecord.deliveryCost,
              reasoning: supplierRecord.reasoning,
            };
            const supCheck =
              data!.data.Order_Delivery_Calculation.supplierCheckouts.find(
                (r) => r.supplierId === supplierRecord.Supplier_ID,
              );
            return (
              <SupplierDelivery
                key={supplierRecord.Supplier_ID}
                cart={cart}
                flashingCart={flashingCart as any}
                supplierCheckout={supCheck as any}
                record={record}
              />
            );
          },
        )}
      </div>
      {data!.data.Order_Delivery_Calculation.totalDeliveryCost > 0 && (
        <div className="flex items-center border-t border-t-surface py-3 fixed left-0 bottom-[60px] right-0 md:absolute md:-left-5 md:-right-5 bg-white">
          <div className="w-2/12 pl-5">
            <FaTruckMoving size={24} />
          </div>
          <div className="w-6/12 font-semibold">Delivery Fee</div>
          <div className="w-4/12 font-medium text-right pr-5">
            {formatPrice(
              data!.data.Order_Delivery_Calculation.totalDeliveryCost,
            ).slice(1)}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center font-bold text-2xl px-5 py-3 border-t-4 border-t-surface fixed left-0 bottom-0 right-0 md:absolute md:-left-5 md:-right-5">
        <div>Sub Total</div>
        <div>{formatPrice(data!.data.Order_Total_Price_GST).slice(1)}</div>
      </div>
      {data!.data!.Order_Invoice.Invoice_Amount_Outstanding > 0 && (
        <div className="fixed left-0 bottom-0 right-0 md:absolute md:-left-5 md:-right-5 bg-white px-5 py-4">
          <div className="flex justify-between items-center font-bold p-4 bg-primary text-on-primary rounded-pova-lg">
            <div>
              ${data!.data!.Order_Invoice.Invoice_Amount_Outstanding.toFixed(2)}
            </div>
            <Link
              href={
                data!.data.Order_Customer.Customer
                  .Credit_Limit_Available_Amount &&
                data!.data.Order_Customer.Customer
                  .Credit_Limit_Available_Amount >=
                  data!.data!.Order_Invoice.Invoice_Amount_Outstanding
                  ? `/order/${data!.data._id}/payment-method`
                  : `/order/${data!.data._id}/payment`
              }
            >
              Pay Remaining
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
