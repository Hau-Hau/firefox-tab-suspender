import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import WasmService from '~/main/background/js/core/services/WasmService';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register([WasmService, CFunctionsProvider])
class TabsOnUpdatedAction {
  constructor (wasmService, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  async run (changeInfo, tab) {
    if (tab.url.includes('about:')) {
      return;
    }

    this._wasmService.passArrayToWasm(
      EventType.TABS_ON_UPDATED,
      this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
      [
        tab.windowId,
        tab.id,
        changeInfo.pinned == null ? 2 : changeInfo.pinned & 1,
        changeInfo.audible == null ? 2 : changeInfo.audible & 1,
      ],
      HeapType.HEAP32,
    );
  }
}
