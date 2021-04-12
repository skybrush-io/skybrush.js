const _counters = {};

export const Counters = {
  RTK: 'rtk',
  OUTPUT: 'output',
};

function ensureCounter(key) {
  if (_counters[key] === undefined) {
    _counters[key] = {
      packets: 0,
      bytes: 0,
      timestamp: null,
      dirty: false,
    };
  }

  return _counters[key];
}

function stamp(item) {
  item.timestamp = performance.now();
  item.dirty = true;
}

export function addToCounter(key, bytes, packets = 1) {
  const item = ensureCounter(key);
  item.packets += packets;
  item.bytes += bytes;
  stamp(item);
  return item;
}

export function clearCounter(key) {
  const item = ensureCounter(key);
  item.packets = 0;
  item.bytes = 0;
  item.dirty = true;
  return item;
}

export function getCounter(key) {
  const item = ensureCounter(key);
  item.dirty = false;
  return item;
}

export function getCounterIfDirty(key) {
  const item = ensureCounter(key);

  if (item.dirty) {
    item.dirty = false;
    return item;
  }

  return undefined;
}
