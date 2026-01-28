import { MongooseDocument } from "./mongoose-document";

export interface Supplier extends MongooseDocument {
  Supplier_Image_Square: string;
  Supplier_Name: string;
  Supplier_Image: string;
}
