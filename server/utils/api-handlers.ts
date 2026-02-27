import type { EventHandler, H3Event } from "h3";
import type { Model, PopulateOptions } from "mongoose";
import type { ObjectSchema } from "yup";

// ─── Types ───────────────────────────────────────────────────

interface GetAllOptions {
  /** Mongoose field selection string, e.g. '-password' */
  select?: string;
  /** Sort object or string, e.g. { date: -1 } or '-date' */
  sort?: Record<string, 1 | -1> | string;
  /** Populate config: string, array of strings, or PopulateOptions */
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  /** Limit the number of results */
  limit?: number;
}

interface GetByIdOptions {
  /** The route param name for the ID (default: auto-detected from '_id' or 'id') */
  paramName?: string;
  /** Populate config */
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
}

interface CreateOptions {
  /** Yup validation schema for create */
  schema?: ObjectSchema<any>;
  /** Populate after save (e.g. 'contact') */
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  /**
   * Fields to clean up before saving.
   * - 'deleteIfFalsy': delete the key if the value is falsy (for optional ObjectId refs)
   */
  falsyFields?: Record<string, "deleteIfFalsy">;
}

interface UpdateOptions {
  /** The route param name for the ID */
  paramName?: string;
  /** Yup validation schema for update */
  schema?: ObjectSchema<any>;
  /** Populate on the findByIdAndUpdate result */
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  /**
   * Fields to nullify if falsy (for optional ObjectId refs that should become null on update)
   */
  nullableFields?: string[];
}

interface ReferenceCheck {
  /** The Mongoose model to check for references */
  model: Model<any>;
  /** The field path to match against the deleted document's ID */
  field: string;
  /** Human-readable label for error messages, e.g. 'production record(s)' */
  label: string;
}

interface DeleteOptions {
  /** The route param name for the ID */
  paramName?: string;
  /** Reference checks to run before allowing deletion */
  referenceChecks?: ReferenceCheck[];
  /**
   * Custom pre-delete validation. Runs after reference checks.
   * Throw a createError() to prevent deletion.
   */
  preDelete?: (id: string, event: H3Event) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Extract the document ID from the route params.
 * Tries the explicit paramName first, then falls back to '_id' and 'id'.
 */
function extractId(event: H3Event, paramName?: string): string {
  const params = event.context.params;
  const id = paramName
    ? params?.[paramName]
    : params?._id ?? params?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing document ID" });
  }
  return id;
}

/**
 * Derive a human-readable resource name from the Mongoose model name.
 * e.g. 'PurchaseOrder' -> 'purchase order', 'Bottle' -> 'bottle'
 */
function modelLabel(model: Model<any>): string {
  // modelName is PascalCase; insert spaces before capitals and lowercase
  return model.modelName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
}

// ─── Factories ───────────────────────────────────────────────

/**
 * Standard GET-all handler: Model.find().lean()
 * Supports select, sort, populate, and limit.
 */
export function createGetAllHandler(
  model: Model<any>,
  options: GetAllOptions = {},
): EventHandler {
  const label = modelLabel(model);

  return defineEventHandler(async () => {
    try {
      let query = model.find({});

      if (options.select) query = query.select(options.select);
      if (options.sort) query = query.sort(options.sort);
      if (options.populate) query = query.populate(options.populate as any);
      if (options.limit) query = query.limit(options.limit);

      return await query.lean();
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch ${label}s`,
      });
    }
  });
}

/**
 * Standard GET-by-ID handler: Model.findById(id).lean()
 * Returns 404 if not found.
 */
export function createGetByIdHandler(
  model: Model<any>,
  options: GetByIdOptions = {},
): EventHandler {
  const label = modelLabel(model);

  return defineEventHandler(async (event) => {
    try {
      const id = extractId(event, options.paramName);
      let query = model.findById(id);

      if (options.populate) query = query.populate(options.populate as any);

      const doc = await query.lean();
      if (!doc) {
        throw createError({
          statusCode: 404,
          statusMessage: `${model.modelName} not found`,
        });
      }
      return doc;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch ${label}`,
      });
    }
  });
}

/**
 * Standard POST create handler: readBody -> sanitize -> validate -> save
 * Supports validation schema, populate after save, and falsy field cleanup.
 */
export function createCreateHandler(
  model: Model<any>,
  options: CreateOptions = {},
): EventHandler {
  const label = modelLabel(model);

  return defineEventHandler(async (event) => {
    const body = await readBody(event);
    const sanitized = sanitize(body);

    if (options.schema) {
      await validateBody(sanitized, options.schema);
    }

    // Clean up falsy optional fields (e.g. empty ObjectId refs)
    if (options.falsyFields) {
      for (const [field, action] of Object.entries(options.falsyFields)) {
        if (action === "deleteIfFalsy" && !sanitized[field]) {
          delete sanitized[field];
        }
      }
    }

    try {
      const doc = new model(sanitized);
      await doc.save();

      if (options.populate) {
        await doc.populate(options.populate as any);
      }

      return doc;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create ${label}`,
      });
    }
  });
}

/**
 * Standard PUT update handler: readBody -> sanitize -> validate -> findByIdAndUpdate
 * Returns 404 if not found. Supports nullable fields and populate.
 */
export function createUpdateHandler(
  model: Model<any>,
  options: UpdateOptions = {},
): EventHandler {
  const label = modelLabel(model);

  return defineEventHandler(async (event) => {
    const id = extractId(event, options.paramName);
    const body = await readBody(event);
    const sanitized = sanitize(body);

    if (options.schema) {
      await validateBody(sanitized, options.schema);
    }

    // Set falsy optional refs to null so Mongoose clears them
    if (options.nullableFields) {
      for (const field of options.nullableFields) {
        if (!sanitized[field]) {
          sanitized[field] = null;
        }
      }
    }

    try {
      let query = model.findByIdAndUpdate(id, sanitized, { new: true });

      if (options.populate) query = query.populate(options.populate as any);

      const updated = await query;
      if (!updated) {
        throw createError({
          statusCode: 404,
          statusMessage: `${model.modelName} not found`,
        });
      }
      return updated;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update ${label}`,
      });
    }
  });
}

/**
 * Standard DELETE handler with optional reference checking.
 * Runs referenceChecks first, then optional preDelete hook, then deletes.
 * Returns 404 if not found, 400 if references exist.
 */
export function createDeleteHandler(
  model: Model<any>,
  options: DeleteOptions = {},
): EventHandler {
  const label = modelLabel(model);

  return defineEventHandler(async (event) => {
    try {
      const id = extractId(event, options.paramName);

      // Run reference checks
      if (options.referenceChecks) {
        for (const check of options.referenceChecks) {
          const count = await check.model.countDocuments({ [check.field]: id });
          if (count > 0) {
            throw createError({
              statusCode: 400,
              statusMessage: `Cannot delete: ${count} ${check.label} reference this ${label}`,
            });
          }
        }
      }

      // Run custom pre-delete validation
      if (options.preDelete) {
        await options.preDelete(id, event);
      }

      const deleted = await model.findByIdAndDelete(id);
      if (!deleted) {
        throw createError({
          statusCode: 404,
          statusMessage: `${model.modelName} not found`,
        });
      }
      return { message: `${model.modelName} deleted successfully` };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete ${label}`,
      });
    }
  });
}
