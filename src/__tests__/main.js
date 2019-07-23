//= ./.tmp/service.js

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

function sum(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  Module.onRuntimeInitialized = _ => {
    const pushEvent1D = Module.cwrap("cPushEvent1D", null, ["number", "number", "number"]);

  }
});
