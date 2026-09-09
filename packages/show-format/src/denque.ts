// Vendored copy of 'denque', which is now archived on Github. Source reformatted and
// converted to TypeScript.

export interface IDenqueOptions {
  capacity?: number;
}

/**
 * Custom implementation of a double ended queue.
 */
export class Denque<T> {
  private _capacity: number | undefined;
  private _head: number;
  private _tail: number;
  private _capacityMask: number;
  private _list: Array<T | undefined>;

  public constructor(array: T[] = [], options: IDenqueOptions = {}) {
    this._capacity = options.capacity;

    this._head = 0;
    this._tail = 0;

    this._capacityMask = 0x3;
    this._list = new Array(4);

    if (Array.isArray(array)) {
      this._fromArray(array);
    }
  }

  /**
   * --------------
   *  PUBLIC API
   * -------------
   */

  /**
   * Returns the item at the specified index from the list.
   * 0 is the first element, 1 is the second, and so on...
   * Elements at negative values are that many from the end: -1 is one before the end
   * (the last element), -2 is two before the end (one before last), etc.
   * @param index
   * @returns {*}
   */
  peekAt(index: number): T | undefined {
    var i = index;
    // expect a number or return undefined
    if (i !== (i | 0)) {
      return void 0;
    }
    var len = this.size();
    if (i >= len || i < -len) return undefined;
    if (i < 0) i += len;
    i = (this._head + i) & this._capacityMask;
    return this._list[i];
  }

  /**
   * Alias for peekAt()
   */
  get(i: number): T | undefined {
    return this.peekAt(i);
  }

  /**
   * Returns the first item in the list without removing it.
   */
  peek(): T | undefined {
    if (this._head === this._tail) return undefined;
    return this._list[this._head];
  }

  /**
   * Alias for peek()
   */
  peekFront(): T | undefined {
    return this.peek();
  }

  /**
   * Returns the item that is at the back of the queue without removing it.
   * Uses peekAt(-1)
   */
  peekBack() {
    return this.peekAt(-1);
  }

  /**
   * Returns the current length of the queue
   * @return {Number}
   */
  get length(): number {
    return this.size();
  }

  /**
   * Return the number of items on the list, or 0 if empty.
   * @returns {number}
   */
  size(): number {
    if (this._head === this._tail) return 0;
    if (this._head < this._tail) return this._tail - this._head;
    else return this._capacityMask + 1 - (this._head - this._tail);
  }

  /**
   * Add an item at the beginning of the list.
   * @param item
   */
  unshift(item: T): number {
    if (arguments.length === 0) return this.size();
    var len = this._list.length;
    this._head = (this._head - 1 + len) & this._capacityMask;
    this._list[this._head] = item;
    if (this._tail === this._head) this._growArray();
    if (this._capacity && this.size() > this._capacity) this.pop();
    if (this._head < this._tail) return this._tail - this._head;
    else return this._capacityMask + 1 - (this._head - this._tail);
  }

  /**
   * Remove and return the first item on the list,
   * Returns undefined if the list is empty.
   */
  shift(): T | undefined {
    var head = this._head;
    if (head === this._tail) return undefined;
    var item = this._list[head];
    this._list[head] = undefined;
    this._head = (head + 1) & this._capacityMask;
    if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >>> 2)
      this._shrinkArray();
    return item;
  }

  /**
   * Add an item to the bottom of the list.
   */
  push(item: T): number {
    if (arguments.length === 0) return this.size();
    var tail = this._tail;
    this._list[tail] = item;
    this._tail = (tail + 1) & this._capacityMask;
    if (this._tail === this._head) {
      this._growArray();
    }
    if (this._capacity && this.size() > this._capacity) {
      this.shift();
    }
    if (this._head < this._tail) return this._tail - this._head;
    else return this._capacityMask + 1 - (this._head - this._tail);
  }

  /**
   * Remove and return the last item on the list.
   * Returns undefined if the list is empty.
   */
  pop(): T | undefined {
    var tail = this._tail;
    if (tail === this._head) return undefined;
    var len = this._list.length;
    this._tail = (tail - 1 + len) & this._capacityMask;
    var item = this._list[this._tail];
    this._list[this._tail] = undefined;
    if (this._head < 2 && tail > 10000 && tail <= len >>> 2)
      this._shrinkArray();
    return item;
  }

  /**
   * Remove and return the item at the specified index from the list.
   * Returns undefined if the list is empty.
   */
  removeOne(index: number): T | undefined {
    var i = index;
    // expect a number or return undefined
    if (i !== (i | 0)) {
      return void 0;
    }
    if (this._head === this._tail) return void 0;
    var size = this.size();
    var len = this._list.length;
    if (i >= size || i < -size) return void 0;
    if (i < 0) i += size;
    i = (this._head + i) & this._capacityMask;
    var item = this._list[i];
    var k;
    if (index < size / 2) {
      for (k = index; k > 0; k--) {
        this._list[i] = this._list[(i = (i - 1 + len) & this._capacityMask)];
      }
      this._list[i] = void 0;
      this._head = (this._head + 1 + len) & this._capacityMask;
    } else {
      for (k = size - 1 - index; k > 0; k--) {
        this._list[i] = this._list[(i = (i + 1 + len) & this._capacityMask)];
      }
      this._list[i] = void 0;
      this._tail = (this._tail - 1 + len) & this._capacityMask;
    }
    return item;
  }

  /**
   * Remove number of items from the specified index from the list.
   * Returns array of removed items.
   * Returns undefined if the list is empty.
   */
  remove(index: number, count: number): T[] | undefined {
    var i = index;
    var removed;
    var del_count = count;
    // expect a number or return undefined
    if (i !== (i | 0)) {
      return void 0;
    }
    if (this._head === this._tail) return void 0;
    var size = this.size();
    var len = this._list.length;
    if (i >= size || i < -size || count < 1) return void 0;
    if (i < 0) i += size;
    if (count === 1 || !count) {
      removed = new Array(1);
      removed[0] = this.removeOne(i);
      return removed;
    }
    if (i === 0 && i + count >= size) {
      removed = this.toArray();
      this.clear();
      return removed;
    }
    if (i + count > size) count = size - i;
    var k;
    removed = new Array(count);
    for (k = 0; k < count; k++) {
      removed[k] = this._list[(this._head + i + k) & this._capacityMask];
    }
    i = (this._head + i) & this._capacityMask;
    if (index + count === size) {
      this._tail = (this._tail - count + len) & this._capacityMask;
      for (k = count; k > 0; k--) {
        this._list[(i = (i + 1 + len) & this._capacityMask)] = void 0;
      }
      return removed;
    }
    if (index === 0) {
      this._head = (this._head + count + len) & this._capacityMask;
      for (k = count - 1; k > 0; k--) {
        this._list[(i = (i + 1 + len) & this._capacityMask)] = void 0;
      }
      return removed;
    }
    if (i < size / 2) {
      this._head = (this._head + index + count + len) & this._capacityMask;
      for (k = index; k > 0; k--) {
        this.unshift(this._list[(i = (i - 1 + len) & this._capacityMask)]!);
      }
      i = (this._head - 1 + len) & this._capacityMask;
      while (del_count > 0) {
        this._list[(i = (i - 1 + len) & this._capacityMask)] = void 0;
        del_count--;
      }
      if (index < 0) this._tail = i;
    } else {
      this._tail = i;
      i = (i + count + len) & this._capacityMask;
      for (k = size - (count + index); k > 0; k--) {
        this.push(this._list[i++]!);
      }
      i = this._tail;
      while (del_count > 0) {
        this._list[(i = (i + 1 + len) & this._capacityMask)] = void 0;
        del_count--;
      }
    }
    if (this._head < 2 && this._tail > 10000 && this._tail <= len >>> 2)
      this._shrinkArray();
    return removed;
  }

  /**
   * Soft clear - does not reset capacity.
   */
  clear(): void {
    this._list = new Array(this._list.length);
    this._head = 0;
    this._tail = 0;
  }

  /**
   * Returns true or false whether the list is empty.
   */
  isEmpty(): boolean {
    return this._head === this._tail;
  }

  /**
   * Returns an array of all queue items.
   */
  toArray(): T[] {
    return this._copyArray(false);
  }

  /**
   * -------------
   *   INTERNALS
   * -------------
   */

  /**
   * Fills the queue with items from an array
   * For use in the constructor
   * @param array
   * @private
   */
  private _fromArray(array: T[]): void {
    var length = array.length;
    var capacity = this._nextPowerOf2(length);

    this._list = new Array(capacity);
    this._capacityMask = capacity - 1;
    this._tail = length;

    for (var i = 0; i < length; i++) this._list[i] = array[i];
  }

  /**
   *
   * @param fullCopy
   * @param size Initialize the array with a specific size. Will default to the current list size
   * @returns {Array}
   * @private
   */
  private _copyArray(fullCopy: boolean, size?: number) {
    var src = this._list;
    var capacity = src.length;
    var length = this.length;
    size = size ?? length;

    // No prealloc requested and the buffer is contiguous
    if (size == length && this._head < this._tail) {
      // Simply do a fast slice copy
      return this._list.slice(this._head, this._tail);
    }

    var dest = new Array(size);

    var k = 0;
    var i;
    if (fullCopy || this._head > this._tail) {
      for (i = this._head; i < capacity; i++) dest[k++] = src[i];
      for (i = 0; i < this._tail; i++) dest[k++] = src[i];
    } else {
      for (i = this._head; i < this._tail; i++) dest[k++] = src[i];
    }

    return dest;
  }

  /**
   * Grows the internal list array.
   * @private
   */
  private _growArray() {
    if (this._head != 0) {
      // double array size and copy existing data, head to end, then beginning to tail.
      var newList = this._copyArray(true, this._list.length << 1);

      this._tail = this._list.length;
      this._head = 0;

      this._list = newList;
    } else {
      this._tail = this._list.length;
      this._list.length <<= 1;
    }

    this._capacityMask = (this._capacityMask << 1) | 1;
  }

  /**
   * Shrinks the internal list array.
   * @private
   */
  private _shrinkArray(): void {
    this._list.length >>>= 1;
    this._capacityMask >>>= 1;
  }

  /**
   * Find the next power of 2, at least 4
   * @private
   * @param {number} num
   * @returns {number}
   */
  private _nextPowerOf2(num: number): number {
    var log2 = Math.log(num) / Math.log(2);
    var nextPow2 = 1 << (log2 + 1);

    return Math.max(nextPow2, 4);
  }
}

export default Denque;
