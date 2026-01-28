import { Industry } from "./industry";
import { MongooseDocument } from "./mongoose-document";
import { Supplier } from "./supplier";

export interface ProductSummary extends MongooseDocument {
  Name: string;
  Image: string;
  Colours: number;
  Variants: number;
  Cutting: boolean;
  displayPrice: number;
  discountedPrice?: number;
  trending?: boolean;
}

export interface Product extends MongooseDocument {
  Branch_Item: {
    Item_Name: string;
    Item_Industry: Array<Pick<Industry, "Industry_Name">>;
    Item_Category: Array<Pick<Industry["Categories"][0], "Category_Name">>;
    Item_Image: string;
    Item_Image_Large: string;
    Item_Description: string;
    Item_ID: string;
    Item_Supplier: Pick<Supplier, "Supplier_Name">;
  };
  Branch_Item_Variants: Array<Variant>;
}

export interface Variant extends MongooseDocument {
  Variant_Size: string;
  Variant_Selling_Price: number;
  Variant_Colour?: {
    _id: string;
    Colour_Name: string;
    Colour_Category: {
      _id: string;
      Colour_Category_Name: string;
    };
    Colour_Code: string;
    Secondary_Colour_Code?: string;
  };
  Variant_Size_Type: string;
  Variant_Size_Type_Units?: string;
  Variant_Size_Min?: number;
  Variant_Size_Max?: number;
  Variant_Size_Type_Option?: string;
  Variant_ID: string;
  Variant_Size_ID: string;
  Variant_Stock_Lengths?: Array<{ Length: number; Selling_Price: number }>;
}
