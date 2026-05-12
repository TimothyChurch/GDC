import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { defineStore } from 'pinia';
import { useCrudStore } from '~/composables/useCrudStore';

interface Widget {
	_id: string;
	name: string;
	count: number;
}

const defaultWidget = (): Widget => ({ _id: '', name: '', count: 0 });

const useWidgetStore = defineStore('widgets', () =>
	useCrudStore<Widget>({
		name: 'Widget',
		apiPath: '/api/widget',
		defaultItem: defaultWidget,
	}),
);

const useSortedWidgetStore = defineStore('widgets-sorted', () =>
	useCrudStore<Widget>({
		name: 'Widget',
		apiPath: '/api/widget',
		defaultItem: defaultWidget,
		sort: (items) => items.sort((a, b) => a.name.localeCompare(b.name)),
	}),
);

const useTransformedWidgetStore = defineStore('widgets-transformed', () =>
	useCrudStore<Widget>({
		name: 'Widget',
		apiPath: '/api/widget',
		defaultItem: defaultWidget,
		beforeCreate: (data) => ({ ...data, name: `[new] ${data.name}` }),
		beforeUpdate: (data) => {
			const { _id, ...rest } = data;
			return { ...rest, name: rest.name.trim() } as Partial<Widget>;
		},
	}),
);

const useNoResetStore = defineStore('widgets-no-reset', () =>
	useCrudStore<Widget>({
		name: 'Widget',
		apiPath: '/api/widget',
		defaultItem: defaultWidget,
		resetOnSave: false,
	}),
);

describe('useCrudStore — initial state', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	it('starts with empty items, default item, and loading flags off', () => {
		const s = useWidgetStore();
		expect(s.items).toEqual([]);
		expect(s.item).toEqual({ _id: '', name: '', count: 0 });
		expect(s.loading).toBe(false);
		expect(s.saving).toBe(false);
		expect(s.loaded).toBe(false);
	});
});

describe('useCrudStore — getAll', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('GETs from apiPath and stores the response', async () => {
		const fetchMock = vi.fn().mockResolvedValue([
			{ _id: '1', name: 'A', count: 1 },
			{ _id: '2', name: 'B', count: 2 },
		]);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.getAll();

		expect(fetchMock).toHaveBeenCalledWith('/api/widget');
		expect(s.items).toHaveLength(2);
		expect(s.items[0]!.name).toBe('A');
	});

	it('appends query string when params provided', async () => {
		const fetchMock = vi.fn().mockResolvedValue([]);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.getAll({ active: 'true', limit: '5' });

		expect(fetchMock).toHaveBeenCalledWith('/api/widget?active=true&limit=5');
	});

	it('omits query string when params is empty', async () => {
		const fetchMock = vi.fn().mockResolvedValue([]);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.getAll({});

		expect(fetchMock).toHaveBeenCalledWith('/api/widget');
	});

	it('toggles `loading` to true during fetch and false after', async () => {
		let resolve: (v: Widget[]) => void = () => {};
		vi.stubGlobal('$fetch', vi.fn(() => new Promise<Widget[]>((r) => { resolve = r; })));

		const s = useWidgetStore();
		const promise = s.getAll();
		expect(s.loading).toBe(true);
		resolve([]);
		await promise;
		expect(s.loading).toBe(false);
	});

	it('applies optional sort callback after load', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([
			{ _id: '2', name: 'B', count: 1 },
			{ _id: '1', name: 'A', count: 2 },
		]));

		const s = useSortedWidgetStore();
		await s.getAll();

		expect(s.items.map((w) => w.name)).toEqual(['A', 'B']);
	});

	it('clears `loading` flag even when fetch rejects', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('boom')));
		const s = useWidgetStore();
		await expect(s.getAll()).rejects.toThrow('boom');
		expect(s.loading).toBe(false);
	});
});

describe('useCrudStore — ensureLoaded', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('runs getAll once and flips loaded=true', async () => {
		const fetchMock = vi.fn().mockResolvedValue([]);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.ensureLoaded();
		expect(s.loaded).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('skips refetch on subsequent calls', async () => {
		const fetchMock = vi.fn().mockResolvedValue([]);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.ensureLoaded();
		await s.ensureLoaded();
		await s.ensureLoaded();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('keeps loaded=false on failure so the next call retries', async () => {
		const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		await s.ensureLoaded();
		expect(s.loaded).toBe(false);

		// Next call retries
		fetchMock.mockResolvedValueOnce([]);
		await s.ensureLoaded();
		expect(s.loaded).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

describe('useCrudStore — setItem / resetItem / getById', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	it('setItem deep-clones an item from the list (mutations are isolated)', async () => {
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 1 });

		s.setItem('1');
		expect(s.item).toMatchObject({ _id: '1', name: 'A', count: 1 });

		s.item.name = 'mutated';
		expect(s.items[0]!.name).toBe('A'); // original untouched
	});

	it('setItem is a no-op for an unknown id (item stays as-is)', () => {
		const s = useWidgetStore();
		const before = { ...s.item };
		s.setItem('does-not-exist');
		expect(s.item).toEqual(before);
	});

	it('resetItem returns the singleton to default values', () => {
		const s = useWidgetStore();
		s.item.name = 'dirty';
		s.item.count = 99;
		s.resetItem();
		expect(s.item).toEqual({ _id: '', name: '', count: 0 });
	});

	it('getById returns the matching item or undefined', () => {
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 1 });
		expect(s.getById('1')?.name).toBe('A');
		expect(s.getById('missing')).toBeUndefined();
	});
});

describe('useCrudStore — saveItem (create)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('POSTs to apiPath/create when item has no _id, appends response', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ _id: 'new1', name: 'Bar', count: 5 });
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		s.item.name = 'Bar';
		s.item.count = 5;

		const result = await s.saveItem();

		expect(fetchMock).toHaveBeenCalledWith('/api/widget/create', {
			method: 'POST',
			body: { name: 'Bar', count: 5 },
		});
		expect(s.items).toContainEqual({ _id: 'new1', name: 'Bar', count: 5 });
		expect(result._id).toBe('new1');
	});

	it('strips _id from create payload', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ _id: 'new1', name: 'X', count: 0 });
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		s.item._id = 'should-not-be-sent' as any;
		// But since _id is set, it would route through update path. Reset it.
		s.item._id = '';
		s.item.name = 'X';
		await s.saveItem();

		const callBody = fetchMock.mock.calls[0]![1].body;
		expect(callBody).not.toHaveProperty('_id');
	});

	it('applies beforeCreate transform', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ _id: 'n1', name: '[new] Hi', count: 0 });
		vi.stubGlobal('$fetch', fetchMock);

		const s = useTransformedWidgetStore();
		s.item.name = 'Hi';
		await s.saveItem();

		expect(fetchMock.mock.calls[0]![1].body.name).toBe('[new] Hi');
	});

	it('resets item to defaults after successful create (default behavior)', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ _id: '1', name: 'X', count: 0 }));
		const s = useWidgetStore();
		s.item.name = 'X';
		await s.saveItem();
		expect(s.item).toEqual({ _id: '', name: '', count: 0 });
	});

	it('preserves item after save when resetOnSave: false', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ _id: '1', name: 'Y', count: 0 }));
		const s = useNoResetStore();
		s.item.name = 'Y';
		await s.saveItem();
		expect(s.item.name).toBe('Y');
	});

	it('rethrows so callers can react; saving flag clears', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('400')));
		const s = useWidgetStore();
		s.item.name = 'X';
		await expect(s.saveItem()).rejects.toThrow('400');
		expect(s.saving).toBe(false);
	});
});

describe('useCrudStore — saveItem (update)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('PUTs to apiPath/:id when item has _id, replaces in list', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ _id: '1', name: 'Updated', count: 99 });
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'Old', count: 0 });
		s.item = { _id: '1', name: 'Updated', count: 99 };

		await s.saveItem();

		expect(fetchMock).toHaveBeenCalledWith('/api/widget/1', {
			method: 'PUT',
			body: { _id: '1', name: 'Updated', count: 99 },
		});
		expect(s.items[0]).toEqual({ _id: '1', name: 'Updated', count: 99 });
	});

	it('applies beforeUpdate transform (e.g., strips fields)', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ _id: '1', name: 'X', count: 0 });
		vi.stubGlobal('$fetch', fetchMock);

		const s = useTransformedWidgetStore();
		s.items.push({ _id: '1', name: 'old', count: 0 });
		s.item = { _id: '1', name: '  X  ', count: 0 };
		await s.saveItem();

		// beforeUpdate trims and strips _id
		const body = fetchMock.mock.calls[0]![1].body;
		expect(body.name).toBe('X');
		expect(body).not.toHaveProperty('_id');
	});
});

describe('useCrudStore — upsert', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	it('replaces an item by _id when one exists', () => {
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 1 });
		s.items.push({ _id: '2', name: 'B', count: 2 });

		s.upsert({ _id: '1', name: 'A-updated', count: 99 });

		expect(s.items).toHaveLength(2);
		expect(s.items[0]).toEqual({ _id: '1', name: 'A-updated', count: 99 });
		expect(s.items[1]).toEqual({ _id: '2', name: 'B', count: 2 });
	});

	it('appends when no item with that _id exists', () => {
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 1 });

		s.upsert({ _id: '2', name: 'B', count: 2 });

		expect(s.items).toHaveLength(2);
		expect(s.items[1]).toEqual({ _id: '2', name: 'B', count: 2 });
	});

	it('appends to an empty list', () => {
		const s = useWidgetStore();
		s.upsert({ _id: 'new', name: 'X', count: 0 });
		expect(s.items).toHaveLength(1);
		expect(s.items[0]!._id).toBe('new');
	});

	it('does NOT touch the singleton `item`', () => {
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 1 });
		s.item.name = 'editing';
		s.upsert({ _id: '1', name: 'A-server', count: 99 });
		expect(s.item.name).toBe('editing');
	});
});

describe('useCrudStore — deleteItem', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('DELETEs by id and removes from list', async () => {
		const fetchMock = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('$fetch', fetchMock);

		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'A', count: 0 });
		s.items.push({ _id: '2', name: 'B', count: 0 });

		await s.deleteItem('1');

		expect(fetchMock).toHaveBeenCalledWith('/api/widget/1', { method: 'DELETE' });
		expect(s.items).toHaveLength(1);
		expect(s.items[0]!._id).toBe('2');
	});

	it('does NOT rethrow on failure (toasts and continues)', async () => {
		vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('forbidden')));
		const s = useWidgetStore();
		s.items.push({ _id: '1', name: 'X', count: 0 });

		await expect(s.deleteItem('1')).resolves.toBeUndefined();
		// The list is NOT mutated when the request fails
		expect(s.items).toHaveLength(1);
		expect(s.saving).toBe(false);
	});
});
