import * as yup from "yup";

/**
 * Recursively strip keys starting with '$' to prevent NoSQL injection.
 * Also ensures the result is a plain object (no prototype pollution).
 */
export function sanitize<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize) as unknown as T;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    if (key === "__proto__" || key === "constructor" || key === "prototype")
      continue;
    result[key] = typeof value === "object" ? sanitize(value) : value;
  }
  return result as T;
}

/**
 * Validate request body against a Yup schema.
 * Throws a 400 error with validation messages on failure.
 */
export async function validateBody(
  body: unknown,
  schema: yup.ObjectSchema<any>,
): Promise<any> {
  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation Error",
        data: error.errors,
      });
    }
    throw error;
  }
}

// ─── Resource Schemas ────────────────────────────────────────

export const userCreateSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup.string(),
});

export const userLoginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const batchCreateSchema = yup.object({
  recipe: yup.string().required("Recipe is required"),
  batchSize: yup
    .number()
    .positive("Must be greater than 0")
    .required("Batch size is required"),
  batchSizeUnit: yup.string().required("Unit is required"),
  pipeline: yup.array().of(yup.string()).min(1, "Pipeline must have at least one stage").required("Pipeline is required"),
  currentStage: yup.string().required("Current stage is required"),
});

export const bottleCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  abv: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .min(0, "ABV cannot be negative")
    .max(100, "ABV cannot exceed 100"),
  price: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .min(0, "Price cannot be negative"),
  archived: yup.boolean(),
});

export const cocktailCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  price: yup.number().min(0, "Price cannot be negative"),
});

export const contactCreateSchema = yup.object({
  businessName: yup.string(),
  type: yup.string().required("Type is required"),
  email: yup.string().email("Invalid email"),
  newsletter: yup.boolean(),
});

export const inventoryCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  item: yup.string().required("Item is required"),
  quantity: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .required("Quantity is required"),
  location: yup.string().nullable(),
});

export const itemCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  pricePerUnit: yup.number().min(0, "Price cannot be negative"),
});

export const productionCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  bottle: yup.string().required("Bottle is required"),
  quantity: yup
    .number()
    .positive("Must be greater than 0")
    .required("Quantity is required"),
});

export const purchaseOrderCreateSchema = yup.object({
  vendor: yup.string().required("Vendor is required"),
  date: yup.date().required("Date is required"),
});

export const recipeCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  pipeline: yup.array().of(yup.string()).min(1, "Pipeline must have at least one stage"),
  pipelineTemplate: yup.string(),
});

export const newsletterSubscribeSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  firstName: yup.string(),
  lastName: yup.string(),
  phone: yup.string(),
});

export const eventCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  groupSize: yup
    .number()
    .positive("Must be greater than 0")
    .required("Group size is required"),
  contact: yup.string().required("Contact is required"),
  type: yup
    .string()
    .oneOf(["Private Class", "Private Event", "Tasting"])
    .required("Type is required"),
  status: yup
    .string()
    .oneOf(["Pending", "Confirmed", "Completed", "Cancelled"]),
  notes: yup.string(),
});

export const eventRequestSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  date: yup.date().required("Preferred date is required"),
  groupSize: yup
    .number()
    .positive("Must be greater than 0")
    .required("Group size is required"),
  type: yup
    .string()
    .oneOf(["Private Class", "Private Event", "Tasting"])
    .required("Type is required"),
  notes: yup.string(),
});

export const contactInquirySchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  topic: yup.string().required("Please select a topic"),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

export const vesselCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
});

// ─── Update Schemas (all fields optional) ────────────────────

export const userUpdateSchema = yup.object({
  email: yup.string().email("Invalid email"),
  password: yup.string().min(8, "Password must be at least 8 characters"),
  firstName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string(),
  role: yup.string(),
});

export const batchUpdateSchema = yup.object({
  recipe: yup.string(),
  batchSize: yup.number().positive("Must be greater than 0"),
  batchSizeUnit: yup.string(),
  pipeline: yup.array().of(yup.string()),
  currentStage: yup.string(),
  status: yup.string().oneOf(['active', 'completed', 'cancelled']),
  batchCost: yup.number().min(0),
  recipeCost: yup.number().min(0),
});

export const bottleUpdateSchema = yup.object({
  name: yup.string(),
  abv: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .min(0, "ABV cannot be negative")
    .max(100, "ABV cannot exceed 100"),
  price: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .min(0, "Price cannot be negative"),
  archived: yup.boolean(),
});

export const cocktailUpdateSchema = yup.object({
  name: yup.string(),
  price: yup.number().min(0, "Price cannot be negative"),
});

export const contactUpdateSchema = yup.object({
  businessName: yup.string(),
  type: yup.string(),
  email: yup.string().email("Invalid email"),
  newsletter: yup.boolean(),
});

export const inventoryUpdateSchema = yup.object({
  date: yup.date(),
  item: yup.string(),
  quantity: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
  location: yup.string().nullable(),
});

export const itemUpdateSchema = yup.object({
  name: yup.string(),
  pricePerUnit: yup.number().min(0, "Price cannot be negative"),
});

export const productionUpdateSchema = yup.object({
  date: yup.date(),
  bottle: yup.string(),
  quantity: yup.number().positive("Must be greater than 0"),
});

export const purchaseOrderUpdateSchema = yup.object({
  vendor: yup.string(),
  date: yup.date(),
  status: yup.string(),
});

export const recipeUpdateSchema = yup.object({
  name: yup.string(),
  pipeline: yup.array().of(yup.string()),
  pipelineTemplate: yup.string(),
});

export const eventUpdateSchema = yup.object({
  date: yup.date(),
  groupSize: yup.number().positive("Must be greater than 0"),
  contact: yup.string(),
  type: yup.string().oneOf(["Private Class", "Private Event", "Tasting"]),
  status: yup
    .string()
    .oneOf(["Pending", "Confirmed", "Completed", "Cancelled"]),
  notes: yup.string(),
});

export const vesselUpdateSchema = yup.object({
  name: yup.string(),
  type: yup.string(),
});
