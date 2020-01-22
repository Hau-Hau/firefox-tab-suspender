import Injector from '~/main/background/js/infrastructure/injector/Injector';
import ContextProvider from '~/main/background/js/core/providers/ContextProvider';
import HeapType from '~/main/background/js/core/data/HeapType';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';
import HeapMap from '~/main/background/js/core/data/HeapMap';

export default @Injector.register(
  [ContextProvider, SettingsRepository, CFunctionsProvider],
  x => x.inSingletonScope()
)
class WasmService {
  constructor (contextProvider, settingsRepository, cFunctionsProvider) {
    this._contextProvider = contextProvider;
    this._settingsRepository = settingsRepository;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  _setHeap (typedArray, ptr, heap) {
    switch (heap) {
    case HeapType.HEAP8:
    case HeapType.HEAPU8:
      this._contextProvider.module[heap].set(typedArray, ptr);
      break;
    case HeapType.HEAP16:
    case HeapType.HEAPU16:
      this._contextProvider.module[heap].set(typedArray, ptr >> 1);
      break;
    case HeapType.HEAP32:
    case HeapType.HEAPU32:
    case HeapType.HEAPF32:
      this._contextProvider.module[heap].set(typedArray, ptr >> 2);
      break;
    case HeapType.HEAPF64:
      this._contextProvider.module[heap].set(typedArray, ptr >> 3);
      break;
    }
  }

  initializeWasm () {
    this.passArrayToWasm(
      null,
      this._cFunctionsProvider.cWasmInitialization.bind(this._cFunctionsProvider),
      [
        this._settingsRepository.timeToDiscard,
        this._settingsRepository.neverSuspendPinned & 1,
        this._settingsRepository.neverSuspendPlayingAudio & 1,
        this._settingsRepository.neverSuspendUnsavedFormInput & 1,

        // Desaturate favicon
        true & 1,
      ],
      HeapType.HEAP32,
    );
  }

  passArray2dToWasm (eventId, fn, arrays, heap) {
    const arrayOfPointers = [];
    let segmentSize = null;

    let arraysIndex = arrays.length;
    while (arraysIndex--) {
      if (segmentSize == null) {
        segmentSize = arrays[arraysIndex].length;
      }
      const typedArray = new HeapMap[heap](arrays[arraysIndex]);
      // eslint-disable-next-line private-props/no-use-outside
      arrayOfPointers.push(this._contextProvider.module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT));
      this._setHeap(typedArray, arrayOfPointers[arrayOfPointers.length - 1], heap);
    }
    const typedArrayOfPointers = new Int32Array(arrayOfPointers);
    // eslint-disable-next-line private-props/no-use-outside
    const ptr = this._contextProvider.module._malloc(typedArrayOfPointers.length * typedArrayOfPointers.BYTES_PER_ELEMENT);
    this._contextProvider.module.HEAP32.set(typedArrayOfPointers, ptr >> 2);
    if (eventId == null) {
      fn(ptr, arrayOfPointers.length, segmentSize);
    } else {
      fn(eventId, ptr, arrayOfPointers.length, segmentSize);
    }
    let arrayOfPointersIndex = arrayOfPointers.length;
    while (arrayOfPointersIndex--) {
      // eslint-disable-next-line private-props/no-use-outside
      this._contextProvider.module._free(arrayOfPointers[arrayOfPointersIndex]);
    }
    // eslint-disable-next-line private-props/no-use-outside
    this._contextProvider.module._free(ptr);
  }

  passArrayToWasm (eventId, fn, array, heap) {
    const typedArray = new HeapMap[heap](array);
    // eslint-disable-next-line private-props/no-use-outside
    const ptr = this._contextProvider.module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT);
    this._setHeap(typedArray, ptr, heap);
    if (eventId == null) {
      fn(ptr, array.length);
    } else {
      fn(eventId, ptr, array.length);
    }
    // eslint-disable-next-line private-props/no-use-outside
    this._contextProvider.module._free(ptr);
  }
}
