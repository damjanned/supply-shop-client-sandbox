import { MongooseDocument } from "./mongoose-document";

export interface Industry extends MongooseDocument {
  Industry_Name: string;
  Industry_Image: string;
  Industry_Image_Square: string;
  Categories: Array<Category>;
}

interface Category extends MongooseDocument {
  Category_Name: string;
  Category_Image: string;
}
