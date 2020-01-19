class HeapType {
  constructor () {
    this._HEAP8 = 'HEAP8';
    this._HEAPU8 = 'HEAPU8';
    this._HEAP16 = 'HEAP16';
    this._HEAPU16 = 'HEAPU16';
    this._HEAP32 = 'HEAP32';
    this._HEAPU32 = 'HEAPU32';
    this._HEAPF32 = 'HEAPF32';
    this._HEAPF64 = 'HEAPF64';
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

export default new HeapType();
