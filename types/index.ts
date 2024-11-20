import type { ObjectId } from "mongoose";

export interface Ingredient {
  _id: ObjectId;
  name: string;
  type: string;
  vendor: ObjectId;
}

export interface Recipe {
  _id: ObjectId;
  name: string;
  description: string;
  ingredients: { ingredient: ObjectId; amount: number; unit: string }[];
}

export interface Bottle {
  _id: ObjectId;
  name: string;
  class: string;
  type: string;
  abv: number;
  recipe: ObjectId;
  batches: { batch: ObjectId }[];
}

export interface Inventory {
  _id: ObjectId;
  year: string;
  month: string;
  day: string;
  items: {};
}
