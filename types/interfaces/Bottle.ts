import type { ObjectId } from "mongoose";

export interface Bottle {
  _id: ObjectId;
  name: string;
  class: string;
  type: string;
  abv: number;
  price: number;
  img: string;
  description: string;
  recipe: ObjectId;
  inStock: boolean;
}
