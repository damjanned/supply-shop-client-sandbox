import { MongooseDocument } from "./mongoose-document";

export interface FlashingShape extends MongooseDocument {
  Flashing_Shape_Name: string;
  Flashing_Shape_Image: string;
  Flashing_Shape_Data: string;
}

export interface FlashingVariant extends MongooseDocument {
  Min_Girth: number;
  Max_Girth: number;
  Selling_Price_Array: Array<
    Array<
      | { Max_Girth: number; Selling_Price: number; Tapered_Cost: number }
      | {
          Max_Girth: number;
          Selling_Price: number;
          Tapered_Selling_Price: number;
        }
    >
  >;
  Colour: {
    _id: string;
    Colour_Name: string;
    Colour_Category: {
      _id: string;
      Colour_Category_Name: string;
    };
    Colour_Code: string;
  };
}
