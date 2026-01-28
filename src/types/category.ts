import type { MongooseDocument } from "./mongoose-document";

export interface Category extends MongooseDocument {
  Category_Image: string;
  Category_Name: string;
}
