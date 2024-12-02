import type { ObjectId } from "mongoose";

export interface Item {
  _id: ObjectId;
  name: string;
  type: string;
  vendor: ObjectId;
}

export interface Recipe {
  _id: ObjectId;
  name: string;
  class: string;
  type: string;
  volume: number;
  volumeUnit: string;
  items: { item: ObjectId; amount: number; unit: string }[];
}

export interface Bottle {
  _id: ObjectId;
  name: string;
  abv: number;
  recipe: ObjectId;
}

export interface Inventory {
  _id: ObjectId;
  date: Date;
  type: string;
  category: string;
  items: InventoryItems[];
}

export interface InventoryItems {
  _id: ObjectId;
  behindBar: number;
  inOffice: number;
  total: number;
}

export interface Contact {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  businessName: string;
  type: string;
  website: string;
  address: string;
  email: string;
  phone: string;
}

export interface PurchaseOrder {
  _id: ObjectId;
  status: string;
  vendor: ObjectId;
  items: PurchaseOrderItem[];
  total: number;
  date: Date;
}

export interface PurchaseOrderItem {
  item: ObjectId;
  quantity: number;
  size: number;
  sizeUnit: string;
  price: number;
}
