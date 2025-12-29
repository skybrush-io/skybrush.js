import {
  has,
  isNil,
  property,
  pull,
  reject,
  sortedIndex,
  sortedIndexBy,
} from 'lodash-es';
import { orderBy } from 'natural-orderby';

import { chooseUniqueIdFromName } from './naming.js';

type ItemWithId = {
  id: string;
};

export type Collection<T> = {
  byId: Record<string, T>;
  order: string[];
};

/**
 * Helper functions to deal with ordered collections.
 *
 * Ordered collections are objects with two keys: ``byId`` and ``order``,
 * where ``order`` is an array of string identifiers that define the
 * order of items in the collection, and ``byId`` is a mapping from
 * string identifiers to the corresponding objects.
 *
 * A special string identifier exists for an item that is currently being
 * added to the collection and has not been finalized yet by the user. There
 * can be at most one such item in a collection at any given time.
 */

/**
 * Special value to mark a newly added item in collections. Newly added items
 * are not supposed to appear in the collection itself; they act as temporary
 * placeholders until they are finalized (saved) by the user, in which case they
 * obtain a "real" ID and a place in the collection.
 */
export const NEW_ITEM_ID = '@@newItem';

/**
 * Returns whether the given item has a "real" ID.
 *
 * A "real" ID is one that is not an empty string and not the special "new item"
 * constant.
 *
 * @param {Object}  item  the item to test
 * @return {boolean}  whether the item has a real ID
 */
function hasValidId(item: any): boolean {
  return (
    Boolean(item) &&
    item.id !== undefined &&
    item.id !== null &&
    item.id !== '' &&
    item.id !== NEW_ITEM_ID
  );
}

/**
 * Custom error class that is thrown when we try to add an item to a collection
 * and another item with the same ID already exists.
 */
class ItemExistsError extends Error {
  public id: string;

  constructor(id: string, message = 'An item with the same ID already exists') {
    super(message);
    this.name = 'ItemExistsError';
    this.id = id;
  }
}

/**
 * Ensures that the given item has an ID property.
 *
 * If the item has no ID property yet, but it has a name instead, an ID will
 * be generated from the name and it will be assigned to the item in-place.
 *
 * If the item has no ID property yet, and it has no name either, an exception
 * will be thrown.
 *
 * @param  collection  the collection that the item will be a part of
 * @param  item  the item that needs a unique ID in the collection
 */
function ensureItemHasValidId<T extends ItemWithId>(
  collection: Collection<T>,
  item: T
) {
  if (!hasValidId(item)) {
    if ((item as any).name === undefined) {
      throw new Error('New item needs either an ID or a name');
    }

    item.id = chooseUniqueIdFromName(String((item as any).name), collection);
  } else if (has(collection.byId, item.id)) {
    throw new ItemExistsError(item.id);
  }
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the collection at the given index.
 *
 * When the index is negative or zero, the item will be added at the front.
 *
 * When the item is larger than or equal to the length of the collection, the
 * item will be added at the back.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * If an item with the generated ID already exists in the collection, an error
 * will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item   the item to add
 * @param  {number}   index  the index to add the given item at
 */
export function addItemAt<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  index: number
): void {
  const isNew = item && item.id === NEW_ITEM_ID;

  item = { ...item };
  ensureItemHasValidId(collection, item);

  collection.byId[item.id] = item;

  if (index < 0) {
    collection.order.splice(0, 0, item.id);
  } else if (index >= collection.order.length) {
    collection.order.push(item.id);
  } else {
    collection.order.splice(index, 0, item.id);
  }

  if (isNew) {
    delete collection.byId[NEW_ITEM_ID];
  }
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the collection at the given index, unless an item with the
 * same ID already exists, in which case this function is a no-op.
 *
 * When the index is negative or zero, the item will be added at the front.
 *
 * When the item is larger than or equal to the length of the collection, the
 * item will be added at the back.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item   the item to add
 * @param  {number}   index  the index to add the given item at
 */
export function addItemUnlessExistsAt<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  index: number
) {
  try {
    addItemAt(collection, item, index);
  } catch (error: unknown) {
    if (error instanceof ItemExistsError) {
      /* this is okay */
    }
  }
}

/**
 * Returns the index where a given item should be inserted in a collection to
 * keep the collection sorted by the given key.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item  the item to add
 * @param  {function|string} key   a function that can be called with a
 *         single item and that returns a value that is used to compare items,
 *         or the name of a single property that is used as a sorting key
 * @return {number}   the insertion index
 */
function getInsertionIndexForSortedCollection<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  key: string | ((item: T) => string) = 'id'
) {
  if (key === 'id') {
    /* shortcut for the common case */
    return sortedIndex(collection.order, item.id);
  }

  const getter = typeof key === 'string' ? property(key) : key;
  return sortedIndexBy(collection.order, item.id, (id) => {
    const existingItem = collection.byId[id];
    return existingItem === undefined ? getter(item) : getter(existingItem);
  });
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the collection based on a sorting key function.
 *
 * It is assumed that the collection is already sorted based on the sorting
 * key function.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * If an item with the generated ID already exists in the collection, an error
 * will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item  the item to add
 * @param  {function|string} key   a function that can be called with a
 *         single item and that returns a value that is used to compare items,
 *         or the name of a single property that is used as a sorting key
 */
export function addItemSorted<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  key: string | ((item: T) => string) = 'id'
) {
  const index = getInsertionIndexForSortedCollection(collection, item, key);
  addItemAt(collection, item, index);
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the collection based on a sorting key function, unless an item
 * is already in the collection, in which case this function is a no-op.
 *
 * It is assumed that the collection is already sorted based on the sorting
 * key function.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item  the item to add
 * @param  {function|string} key   a function that can be called with a
 *         single item and that returns a value that is used to compare items,
 *         or the name of a single property that is used as a sorting key
 */
export function addItemSortedUnlessExists<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  key: string | ((item: T) => string) = 'id'
) {
  const index = getInsertionIndexForSortedCollection(collection, item, key);
  addItemUnlessExistsAt(collection, item, index);
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the back of the collection.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * If an item with the generated ID already exists in the collection, an error
 * will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item  the item to add
 */
export function addItemToBack<T extends ItemWithId>(
  collection: Collection<T>,
  item: T
) {
  addItemAt(collection, item, collection.order.length);
}

/**
 * Helper function that receives an item to be added to a collection, and
 * adds it to the front of the collection.
 *
 * The item should already have an assigned `id` property. If there is no such
 * property, or it is equal to the special "new item" value, a new ID will be
 * generated based on the `name` property of the item. If there is no `name`
 * property either, an error will be thrown.
 *
 * If an item with the generated ID already exists in the collection, an error
 * will be thrown.
 *
 * @param  {Object}   collection  the ordered collection to add the item to
 * @param  {Object}   item  the item to add
 */
export function addItemToFront<T extends ItemWithId>(
  collection: Collection<T>,
  item: T
) {
  addItemAt(collection, item, 0);
}

/**
 * Helper function that removes all items from an ordered collection.
 */
export function clearOrderedCollection<T extends ItemWithId>(
  collection: Collection<T>
): void {
  collection.byId = {};
  collection.order = [];
}

/**
 * Creates a new item at the front of the given collection that can then
 * subsequently be edited by the user before it is finalized in the
 * collection.
 *
 * @param  collection  the ordered collection to add the item to
 * @param  factory     a factory function that creates a new item, given its ID
 * @return the newly created item
 */
export function createNewItemInFrontOf<T extends ItemWithId>(
  collection: Collection<T>,
  factory: (id: string) => T
): T {
  const id = NEW_ITEM_ID;
  const newItem = factory(id);
  collection.byId[id] = newItem;
  return newItem;
}

/**
 * Helper function that receives an item ID and an ordered collection,
 * and removes the item with the given ID from the ordered collection.
 *
 * @param  {Object}  collection  the ordered collection to modify
 * @param  {string}  idToRemove  the item ID to remove
 */
export function deleteItemById<T extends ItemWithId>(
  collection: Collection<T>,
  idToRemove: string
) {
  delete collection.byId[idToRemove];
  pull(collection.order, idToRemove);
}

/**
 * Helper function that receives multiple item IDs and an ordered collection,
 * removes the items with the given IDs from the ordered collection.
 *
 * @param  {Object}    collection  the ordered collection to modify
 * @param  {string[]}  idsToRemove  the item IDs to remove
 */
export function deleteItemsById<T extends ItemWithId>(
  collection: Collection<T>,
  idsToRemove: string[]
) {
  for (const id of idsToRemove) {
    delete collection.byId[id];
  }

  pull(collection.order, ...idsToRemove);
}

/**
 * Creates a key path that can be used in a call to <code>lodash.set</code>
 * to update some properties of an item in an ordered collection.
 *
 * @param  {string}  itemId  the ID of the item
 * @param  {...string?} subKeys optional sub-keys that will be appended to the
 *         returned key if you want to update some deeply nested property
 *         of the selected item
 * @return {string}  a key path that corresponds to the item with the
 *         given ID
 */
export const getKey = (itemId: string, ...subKeys: string[]) => {
  if (itemId.includes('.')) {
    throw new Error('Item ID cannot contain dots');
  }

  const subKey = subKeys.join('.');
  return subKey ? `byId.${itemId}.${subKey}` : `byId.${itemId}`;
};

/**
 * Helper function that takes an ordered collection and returns the first item
 * in the collection, or undefined if the collection is empty.
 */
export function selectFirst<T extends ItemWithId>({
  byId,
  order,
}: Collection<T>): T | undefined {
  return order === undefined || order.length === 0 ? undefined : byId[0];
}

/**
 * Helper function that takes an ordered collection and returns the last item
 * in the collection, or undefined if the collection is empty.
 */
export function selectLast<T extends ItemWithId>({
  byId,
  order,
}: Collection<T>): T | undefined {
  return order === undefined || order.length === 0
    ? undefined
    : byId[order.length - 1];
}

/**
 * Helper function that takes an ordered collection and converts it into an
 * array that contains the items according to the order of keys in the
 * `order` part of the ordered collection.
 *
 * @return {Object[]} an array of values from the `byId` part of the ordered
 *     collection, filtered and sorted according to the `order` array
 */
export function selectOrdered<T extends ItemWithId>({
  byId,
  order,
}: Collection<T>): T[] {
  return order === undefined
    ? Object.values(byId)
    : reject<T>(
        order.map((id) => byId[id]),
        isNil
      );
}

/**
 * Helper function that takes a single item and an ordered collection, and
 * attempts to replace the item in the collection based on its ID.
 *
 * If the incoming object has no ID yet, or has an ID but is not in the
 * collection, it will be added to the collection in a way that maintains
 * sortedness according to the given key.
 *
 * @param  {Object}  item  the item to replace in the collection
 * @param  {Object}  collection  the ordered collection to update
 * @param  {function|string} key   a function that can be called with a
 *         single item and that returns a value that is used to compare items,
 *         or the name of a single property that is used as a sorting key
 */
export function replaceItemOrAddSorted<T extends ItemWithId>(
  collection: Collection<T>,
  item: T,
  key: string | ((item: T) => string) = 'id'
) {
  if (hasValidId(item) && collection.byId[item.id]) {
    collection.byId[item.id] = { ...item };
  } else {
    addItemSorted(collection, item, key);
  }
}

/**
 * Helper function that takes a single item and an ordered collection, and
 * attempts to replace the item in the collection based on its ID.
 *
 * If the incoming object has a valid ID, it is assumed that it is already
 * in the collection, but its representation will be replaced.
 *
 * If the incoming object has no ID yet, it will be added to the back of
 * the collection as a new item.
 *
 * @param  {Object}  item  the item to replace in the collection
 * @param  {Object}  collection  the ordered collection to update
 */
export function replaceItemOrAddToBack<T extends ItemWithId>(
  collection: Collection<T>,
  item: T
) {
  if (hasValidId(item) && collection.byId[item.id]) {
    collection.byId[item.id] = { ...item };
  } else {
    addItemToBack(collection, item);
  }
}

/**
 * Helper function that takes a single item and an ordered collection, and
 * attempts to replace the item in the collection based on its ID.
 *
 * If the incoming object has a valid ID, it is assumed that it is already
 * in the collection, but its representation will be replaced.
 *
 * If the incoming object has no ID yet, it will be added to the front of
 * the collection as a new item.
 *
 * @param  {Object}  item  the item to replace in the collection
 * @param  {Object}  collection  the ordered collection to update
 */
export function replaceItemOrAddToFront<T extends ItemWithId>(
  collection: Collection<T>,
  item: T
) {
  if (hasValidId(item) && collection.byId[item.id]) {
    collection.byId[item.id] = { ...item };
  } else {
    addItemToFront(collection, item);
  }
}

/**
 * Helper function that takes an ordered collection and ensures that the items
 * in the collection are sorted using natural sort based on their IDs.
 */
export function useNaturalSort<T extends ItemWithId>(
  collection: Collection<T>
) {
  collection.order = orderBy(collection.order);
}
