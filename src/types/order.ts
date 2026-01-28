import { Customer } from "./customer";
import { MongooseDocument } from "./mongoose-document";

export interface Order extends MongooseDocument {
  Order_Date: string;
  Order_Number: number;
  Order_Total_Price: number;
  Order_Total_Price_GST: number;
  Order_Job_Reference?: string;
  Order_Invoice: {
    _id: string;
    Invoice_Status: keyof typeof InvoiceStatus;
    Invoice_Amount_Outstanding: number;
    Invoice_Amount_Paid: number;
  };
  Order_Customer: {
    Customer: Customer;
  };
  Order_Items: Array<{
    Total_Item_Price: number;
    Quantity: number;
    Variant: string;
    Branch_Item_Object: {
      Branch_Item: {
        Item_Name: string;
      };
    };
    Variant_Object: {
      Variant_Colour: {
        Colour_Name: string;
      } | null;
      Variant_Size_Type_Units?: string;
      Variant_Size: string;
      Variant_Selling_Price: number;
      Variant_Stock_Lengths?: Array<{ Length: number; Selling_Price: number }>;
      Variant_Size_Type: "Standard" | "Non Standard";
    };
    Cutting_List: Array<{
      Quantity: number;
      Size: number;
    }>;
    Item: string;
  }>;
  Order_Flashing_Items: Array<{
    Image: string;
    Cutting_List: Array<{
      Quantity: number;
      Size: number;
      Total_Size_Price: number;
    }>;
    Flashing_Variant: {
      Colour: {
        Colour_Name: string;
      };
    };
    Total_Item_Price: number;
    ClientID: string;
    Total_Girth: number;
    Total_Bends: number;
    Tapered: boolean;
  }>;
  Order_Delivery_Calculation: {
    deliveryAddress: string;
    totalDeliveryCost: number;
    supplierCheckouts: Array<{
      date: string;
      supplierId: string;
      type: "Delivery" | "Pick-Up";
    }>;
    deliveryCalculation: Array<{
      Supplier_Name: string;
      Supplier_ID: string;
      deliveryCost: number;
      flashings: string[];
      items: string[];
      reasoning: string[];
    }>;
  };
  Order_Status: "Pova Confirmed" | "Suppliers Confirmed" | "Completed";
}

export enum InvoiceStatus {
  "Partially Paid" = "Payment Pending",
  "Settled" = "Paid",
  "Refund Approval Pending" = "Refund Pending",
  "Refund Processing" = "Refund Processing",
  "Refund Processed" = "Refunded",
}
