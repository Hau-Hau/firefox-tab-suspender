import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import WasmService from '~/main/background/js/core/services/WasmService';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register([WasmService, CFunctionsProvider])
class TabsOnCreatedAction {
  constructor (wasmService, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  async run (tabId) {
    // Bugfix - Newly created tabs sometimes return active=false when they are active
    setTimeout(async () => {
      const tab = await browser.tabs.get(tabId);
      if (tab == null || tab.id === browser.tabs.TAB_ID_NONE) {
        return;
      }

      this._wasmService.passArrayToWasm(
        EventType.TABS_ON_CREATED,
        this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
        [
          tab.windowId,
          tab.id,
          tab.active & 1,
          tab.title.indexOf('- discarded') > 1 & 1,
          tab.pinned & 1,
          tab.audible & 1,
        ],
        HeapType.HEAP32,
      );
    }, 250);
  }
}
