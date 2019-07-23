//= ./.tmp/service.js

const heapMap = {
  HEAP8: Int8Array,
  HEAPU8: Uint8Array,
  HEAP16: Int16Array,
  HEAPU16: Uint16Array,
  HEAP32: Int32Array,
  HEAPU32: Uint32Array,
  HEAPF32: Float32Array,
  HEAPF64: Float64Array
};

const initialize = Module.cwrap("cInitialize", null, [
  "number",
  "number"
]);
const initializeTabs = Module.cwrap("cTabsInitialization", null, [
  "number",
  "number",
  "number"
]);
const pushEvent1D = Module.cwrap("cPushEvent1D", null, [
  "number",
  "number",
  "number"
]);
const pushEvent2D = Module.cwrap("cPushEvent2D", null, [
  "number",
  "number",
  "number",
  "number"
]);

function setHeap(typedArray, ptr, heap) {
  switch (heap) {
    case "HEAP8":
    case "HEAPU8":
      Module[heap].set(typedArray, ptr);
      break;
    case "HEAP16":
    case "HEAPU16":
      Module[heap].set(typedArray, ptr >> 1);
      break;
    case "HEAP32":
    case "HEAPU32":
    case "HEAPF32":
      Module[heap].set(typedArray, ptr >> 2);
      break;
    case "HEAPF64":
      Module[heap].set(typedArray, ptr >> 3);
      break;
  }
}

function pass2DArrayToWasm(eventId, fn, arrays, heap) {
  const arrayOfPointers = [];
  let segmentSize = undefined;

  let arraysIndex = arrays.length;
  while (arraysIndex--) {
    if (segmentSize === undefined) {
      segmentSize = arrays[arraysIndex].length;
    }
    const typedArray = new heapMap[heap](arrays[arraysIndex]);
    arrayOfPointers.push(
      Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT)
    );
    setHeap(
      typedArray,
      arrayOfPointers[arrayOfPointers.length - 1],
      heap
    );
  }
  const typedArrayOfPointers = new Int32Array(arrayOfPointers);
  var ptr = Module._malloc(
    typedArrayOfPointers.length * typedArrayOfPointers.BYTES_PER_ELEMENT
  );
  Module.HEAP32.set(typedArrayOfPointers, ptr >> 2);
  if (eventId == null) {
    fn(ptr, arrayOfPointers.length, segmentSize);
  } else {
    fn(eventId, ptr, arrayOfPointers.length, segmentSize);
  }
  let arrayOfPointersIndex = arrayOfPointers.length;
  while (arrayOfPointersIndex--) {
    Module._free(arrayOfPointers[arrayOfPointersIndex]);
  }
  Module._free(ptr);
}

function passArrayToWasm(eventId, fn, array, heap) {
  const typedArray = new heapMap[heap](array);
  const ptr = Module._malloc(
    typedArray.length * typedArray.BYTES_PER_ELEMENT
  );
  setHeap(typedArray, ptr, heap);
  fn(eventId, ptr, array.length);
  if (eventId == null) {
    fn(ptr, array.length);
  } else {
    fn(eventId, ptr, array.length);
  }
  Module._free(ptr);
}

test('adds 1 + 2 to equal 3', () => {
  Module.onRuntimeInitialized = _ => {
    passArrayToWasm(
      null,
      initialize,
      [
        0, //timeToDiscard
        0, //neverSuspendPinned
        0, //neverSuspendPlayingAudio
        0, //neverSuspendUnsavedFormInput
        0, //desaturateFavicon
      ],
      "HEAP32"
    );
    var tabs = [
      [
        0, // windowId
        0, //id
        0, //active
        0, //non native discarding method
        0, //pinned
        0, //audible
      ]
    ];
    pass2DArrayToWasm(null, initializeTabs, tabs, "HEAP32");
    passArrayToWasm(1, pushEvent1D, [0], "HEAP32");


    //
  }
});
