class HeapMap {
  constructor () {
    this._HEAP8 = Int8Array;
    this._HEAPU8 = Uint8Array;
    this._HEAP16 = Int16Array;
    this._HEAPU16 = Uint16Array;
    this._HEAP32 = Int32Array;
    this._HEAPU32 = Uint32Array;
    this._HEAPF32 = Float32Array;
    this._HEAPF64 = Float64Array;
  }

  get HEAP8 () {
    return this._HEAP8;
  }

  get HEAPU8 () {
    return this._HEAPU8;
  }

  get HEAP16 () {
    return this._HEAP16;
  }

  get HEAPU16 () {
    return this._HEAPU16;
  }

  get HEAP32 () {
    return this._HEAP32;
  }

  get HEAPU32 () {
    return this._HEAPU32;
  }

  get HEAPF32 () {
    return this._HEAPF32;
  }

  get HEAPF64 () {
    return this._HEAPF64;
  }
}

export default new HeapMap();
