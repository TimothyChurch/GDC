# Debugging Patterns

## ObjectId Empty String Cast Failure (Mongoose)

**Pattern**: Any Mongoose schema field with `type: Schema.Types.ObjectId` will throw a `CastError` if given an empty string `""`. This is because Mongoose tries to cast the string to a BSON ObjectId and `""` is not a valid 24-hex-char ObjectId.

**Where it occurs**: Store default values often initialize ObjectId ref fields as `""` (e.g., `recipe: ""`). When the user creates a new document without selecting a recipe, the empty string goes all the way through to Mongoose and fails at `.save()`.

**Detection**: Look for any field in `server/models/*.schema.ts` that has `type: Schema.Types.ObjectId` and check if the corresponding store default or form data can send `""` for that field.

**Fix on create endpoint**: `if (!sanitized.fieldName) delete sanitized.fieldName;`
**Fix on update endpoint**: `if (!sanitized.fieldName) sanitized.fieldName = null;`
**Fix in store**: `if (!createData.fieldName) delete createData.fieldName;`

**Models with ObjectId refs (as of Feb 2026)**:
- Bottle: `recipe` -> Recipe
- Batch: `recipe` -> Recipe
- Production: `bottle` -> Bottle, `batch` -> Batch
- PurchaseOrder: `vendor` -> Contact
- Item: `vendor` -> Contact
- Vessel: contents may reference batches

**Note**: Mongoose handles `_id: ""` gracefully (generates a new ObjectId), but it's still best practice to strip it.

## Yup Number() with Empty Strings

**Pattern**: `yup.number()` tries to cast values. Empty string `""` casts to `NaN`, which is not a valid number, causing validation failure.

**Detection**: Any `yup.number()` field that isn't `.required()` can receive `""` from a cleared HTML number input.

**Fix**: Chain `.nullable().transform((value, original) => (original === "" ? null : value))` before any `.min()`/`.max()` constraints.

## Error Swallowing in Store -> useFormPanel

**Pattern**: Store CRUD methods that catch errors and show toasts but don't re-throw will cause `useFormPanel` to close the panel even on failure. The `useFormPanel.save()` method calls `onSave()` in a try/catch and only calls `onClose()` if `onSave()` succeeds.

**Fix**: Add `throw error;` after the toast in the store's catch block.
