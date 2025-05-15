import type { ObjectId } from "mongoose";

export interface Recipe {
  _id: ObjectId;
  name: string;
  class: string;
  type: string;
  volume: number;
  volumeUnit: string;
  items: { item: ObjectId; amount: number; unit: string }[];
  directions: string;
}
