import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import WasmService from '~/main/background/js/core/services/WasmService';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register([WasmService, CFunctionsProvider])
class WindowsOnCreatedAction {
  constructor (wasmService, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  async run (windowId) {
    this._wasmService.passArrayToWasm(
      EventType.WINDOWS_ON_CREATED,
      this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
      [windowId],
      HeapType.HEAP32
    );
  }
}
