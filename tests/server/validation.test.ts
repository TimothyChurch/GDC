import { describe, it, expect } from 'vitest';
import {
  sanitize,
  userCreateSchema,
  userLoginSchema,
  batchCreateSchema,
  bottleCreateSchema,
  cocktailCreateSchema,
  contactCreateSchema,
  inventoryCreateSchema,
  itemCreateSchema,
  productionCreateSchema,
  purchaseOrderCreateSchema,
  recipeCreateSchema,
  vesselCreateSchema,
  userUpdateSchema,
  batchUpdateSchema,
  bottleUpdateSchema,
  cocktailUpdateSchema,
  contactUpdateSchema,
  inventoryUpdateSchema,
  itemUpdateSchema,
  productionUpdateSchema,
  purchaseOrderUpdateSchema,
  recipeUpdateSchema,
  vesselUpdateSchema,
} from '~/server/utils/validation';

// ─── sanitize() ─────────────────────────────────────────────

describe('sanitize', () => {
  it('removes keys starting with $', () => {
    const input = { name: 'test', $gt: 100 };
    const result = sanitize(input);
    expect(result).toEqual({ name: 'test' });
    expect(result).not.toHaveProperty('$gt');
  });

  it('removes $ne NoSQL injection payloads', () => {
    const input = { email: { $ne: '' } } as any;
    const result = sanitize(input);
    expect(result).toEqual({ email: {} });
  });

  it('removes prototype pollution keys', () => {
    const input = { __proto__: { isAdmin: true }, name: 'test' };
    const result = sanitize(input);
    expect(result).toEqual({ name: 'test' });
    expect(result).not.toHaveProperty('__proto__');
  });

  it('removes constructor key', () => {
    const input = { constructor: 'evil', name: 'test' };
    const result = sanitize(input);
    expect(result).toEqual({ name: 'test' });
  });

  it('sanitizes nested objects', () => {
    const input = { data: { $where: 'function() {}', safe: true } };
    const result = sanitize(input);
    expect(result).toEqual({ data: { safe: true } });
  });

  it('sanitizes arrays', () => {
    const input = [{ $gt: 1, name: 'a' }, { $lt: 2, name: 'b' }];
    const result = sanitize(input as any);
    expect(result).toEqual([{ name: 'a' }, { name: 'b' }]);
  });

  it('handles null and undefined', () => {
    expect(sanitize(null as any)).toBeNull();
    expect(sanitize(undefined as any)).toBeUndefined();
  });

  it('passes through primitive values', () => {
    expect(sanitize('string' as any)).toBe('string');
    expect(sanitize(42 as any)).toBe(42);
  });

  it('handles deeply nested injection', () => {
    const input = {
      items: [
        { item: 'abc123', amount: { $gte: 0 } },
      ],
    };
    const result = sanitize(input);
    expect(result.items[0].amount).toEqual({});
  });
});

// ─── Create Schemas ─────────────────────────────────────────

describe('userCreateSchema', () => {
  it('validates a valid user', async () => {
    const valid = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };
    await expect(userCreateSchema.validate(valid)).resolves.toBeDefined();
  });

  it('rejects missing email', async () => {
    const invalid = { password: 'password123', firstName: 'John', lastName: 'Doe' };
    await expect(userCreateSchema.validate(invalid)).rejects.toThrow();
  });

  it('rejects invalid email', async () => {
    const invalid = { email: 'notanemail', password: 'password123', firstName: 'John', lastName: 'Doe' };
    await expect(userCreateSchema.validate(invalid)).rejects.toThrow('Invalid email');
  });

  it('rejects short password', async () => {
    const invalid = { email: 'test@example.com', password: '123', firstName: 'John', lastName: 'Doe' };
    await expect(userCreateSchema.validate(invalid)).rejects.toThrow('at least 8 characters');
  });

  it('rejects missing firstName', async () => {
    const invalid = { email: 'test@example.com', password: 'password123', lastName: 'Doe' };
    await expect(userCreateSchema.validate(invalid)).rejects.toThrow();
  });
});

describe('userLoginSchema', () => {
  it('validates valid login', async () => {
    await expect(userLoginSchema.validate({
      email: 'test@example.com',
      password: 'password',
    })).resolves.toBeDefined();
  });

  it('rejects missing password', async () => {
    await expect(userLoginSchema.validate({ email: 'test@example.com' })).rejects.toThrow();
  });
});

describe('batchCreateSchema', () => {
  it('validates valid batch', async () => {
    const valid = { recipe: 'abc123', batchSize: 50, batchSizeUnit: 'gal' };
    await expect(batchCreateSchema.validate(valid)).resolves.toBeDefined();
  });

  it('rejects zero batch size', async () => {
    await expect(batchCreateSchema.validate({
      recipe: 'abc123', batchSize: 0, batchSizeUnit: 'gal',
    })).rejects.toThrow('Must be greater than 0');
  });

  it('rejects negative batch size', async () => {
    await expect(batchCreateSchema.validate({
      recipe: 'abc123', batchSize: -10, batchSizeUnit: 'gal',
    })).rejects.toThrow('Must be greater than 0');
  });
});

describe('bottleCreateSchema', () => {
  it('validates valid bottle', async () => {
    await expect(bottleCreateSchema.validate({
      name: 'Bourbon', abv: 45, price: 29.99,
    })).resolves.toBeDefined();
  });

  it('rejects negative ABV', async () => {
    await expect(bottleCreateSchema.validate({
      name: 'Test', abv: -1,
    })).rejects.toThrow('ABV cannot be negative');
  });

  it('rejects ABV over 100', async () => {
    await expect(bottleCreateSchema.validate({
      name: 'Test', abv: 101,
    })).rejects.toThrow('ABV cannot exceed 100');
  });

  it('rejects negative price', async () => {
    await expect(bottleCreateSchema.validate({
      name: 'Test', price: -5,
    })).rejects.toThrow('Price cannot be negative');
  });
});

describe('cocktailCreateSchema', () => {
  it('validates valid cocktail', async () => {
    await expect(cocktailCreateSchema.validate({
      name: 'Old Fashioned', price: 12,
    })).resolves.toBeDefined();
  });

  it('rejects missing name', async () => {
    await expect(cocktailCreateSchema.validate({ price: 10 })).rejects.toThrow();
  });
});

describe('contactCreateSchema', () => {
  it('validates valid contact', async () => {
    await expect(contactCreateSchema.validate({
      businessName: 'Supplier Co', type: 'Vendor', email: 'info@supplier.com',
    })).resolves.toBeDefined();
  });

  it('rejects invalid email', async () => {
    await expect(contactCreateSchema.validate({
      businessName: 'Supplier', type: 'Vendor', email: 'bademail',
    })).rejects.toThrow('Invalid email');
  });
});

describe('inventoryCreateSchema', () => {
  it('validates with date', async () => {
    await expect(inventoryCreateSchema.validate({
      date: new Date(),
    })).resolves.toBeDefined();
  });

  it('rejects missing date', async () => {
    await expect(inventoryCreateSchema.validate({})).rejects.toThrow();
  });
});

describe('itemCreateSchema', () => {
  it('validates valid item', async () => {
    await expect(itemCreateSchema.validate({
      name: 'Corn Malt', pricePerUnit: 2.50,
    })).resolves.toBeDefined();
  });

  it('rejects negative price', async () => {
    await expect(itemCreateSchema.validate({
      name: 'Test', pricePerUnit: -1,
    })).rejects.toThrow('Price cannot be negative');
  });
});

describe('productionCreateSchema', () => {
  it('validates valid production', async () => {
    await expect(productionCreateSchema.validate({
      date: new Date(), bottle: 'bottle123', quantity: 100,
    })).resolves.toBeDefined();
  });

  it('rejects zero quantity', async () => {
    await expect(productionCreateSchema.validate({
      date: new Date(), bottle: 'bottle123', quantity: 0,
    })).rejects.toThrow('Must be greater than 0');
  });
});

describe('purchaseOrderCreateSchema', () => {
  it('validates valid PO', async () => {
    await expect(purchaseOrderCreateSchema.validate({
      vendor: 'vendor123', date: new Date(),
    })).resolves.toBeDefined();
  });

  it('rejects missing vendor', async () => {
    await expect(purchaseOrderCreateSchema.validate({
      date: new Date(),
    })).rejects.toThrow();
  });
});

describe('recipeCreateSchema', () => {
  it('validates valid recipe', async () => {
    await expect(recipeCreateSchema.validate({ name: 'Bourbon Mash' })).resolves.toBeDefined();
  });

  it('rejects missing name', async () => {
    await expect(recipeCreateSchema.validate({})).rejects.toThrow();
  });
});

describe('vesselCreateSchema', () => {
  it('validates valid vessel', async () => {
    await expect(vesselCreateSchema.validate({
      name: 'Fermenter 1', type: 'Fermenter',
    })).resolves.toBeDefined();
  });

  it('rejects missing type', async () => {
    await expect(vesselCreateSchema.validate({ name: 'Tank' })).rejects.toThrow();
  });
});

// ─── Update Schemas (all fields optional) ────────────────────

describe('update schemas accept empty objects', () => {
  const schemas = [
    { name: 'userUpdateSchema', schema: userUpdateSchema },
    { name: 'batchUpdateSchema', schema: batchUpdateSchema },
    { name: 'bottleUpdateSchema', schema: bottleUpdateSchema },
    { name: 'cocktailUpdateSchema', schema: cocktailUpdateSchema },
    { name: 'contactUpdateSchema', schema: contactUpdateSchema },
    { name: 'inventoryUpdateSchema', schema: inventoryUpdateSchema },
    { name: 'itemUpdateSchema', schema: itemUpdateSchema },
    { name: 'productionUpdateSchema', schema: productionUpdateSchema },
    { name: 'purchaseOrderUpdateSchema', schema: purchaseOrderUpdateSchema },
    { name: 'recipeUpdateSchema', schema: recipeUpdateSchema },
    { name: 'vesselUpdateSchema', schema: vesselUpdateSchema },
  ];

  for (const { name, schema } of schemas) {
    it(`${name} validates empty object (all fields optional)`, async () => {
      await expect(schema.validate({})).resolves.toBeDefined();
    });
  }
});

describe('update schemas enforce constraints on provided fields', () => {
  it('userUpdateSchema rejects invalid email', async () => {
    await expect(userUpdateSchema.validate({ email: 'notvalid' })).rejects.toThrow('Invalid email');
  });

  it('userUpdateSchema rejects short password', async () => {
    await expect(userUpdateSchema.validate({ password: '123' })).rejects.toThrow('at least 8 characters');
  });

  it('bottleUpdateSchema rejects negative ABV', async () => {
    await expect(bottleUpdateSchema.validate({ abv: -1 })).rejects.toThrow('ABV cannot be negative');
  });

  it('batchUpdateSchema rejects negative batchSize', async () => {
    await expect(batchUpdateSchema.validate({ batchSize: -5 })).rejects.toThrow('Must be greater than 0');
  });

  it('itemUpdateSchema rejects negative price', async () => {
    await expect(itemUpdateSchema.validate({ pricePerUnit: -1 })).rejects.toThrow('Price cannot be negative');
  });

  it('productionUpdateSchema rejects negative quantity', async () => {
    await expect(productionUpdateSchema.validate({ quantity: -1 })).rejects.toThrow('Must be greater than 0');
  });
});
