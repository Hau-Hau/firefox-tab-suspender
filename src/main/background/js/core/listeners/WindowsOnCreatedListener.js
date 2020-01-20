import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import WasmService from '~/main/background/js/core/services/WasmService';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register([WasmService, CFunctionsProvider])
class WindowsOnCreatedListener {
  constructor (wasmService, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  run () {
    browser.windows.onCreated.addListener((window) => {
      this._wasmService.passArrayToWasm(
        EventType.WINDOWS_ON_CREATED,
        this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
        [window.id],
        HeapType.HEAP32
      );
    });
  }
}
