import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import WasmService from '~/main/background/js/core/services/WasmService';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';
import ContextProvider
  from '~/main/background/js/core/providers/ContextProvider';

export default @Injector.register([ContextProvider, WasmService, CFunctionsProvider])
class TabsOnActivatedAction {
  constructor (contextProvider, wasmService, cFunctionsProvider) {
    this._contextProvider = contextProvider;
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  async run () {
    if (this._contextProvider.lastOnActivatedCallTime != null &&
      new Date().getTime() - this._contextProvider.lastOnActivatedCallTime <= 400) {
      return;
    }

    const tabs = await browser.tabs.query({});
    const tabsToPass = [];
    for (const tab of tabs) {
      if (tab.url.includes('about:')) {
        continue;
      }
      tabsToPass.push([
        tab.windowId,
        tab.id,
        tab.active & 1,
        tab.title.indexOf('- discarded') > 1 & 1,
        tab.pinned & 1,
        tab.audible & 1,
        Math.floor(tab.lastAccessed / 1000),
      ]);
      this._contextProvider.lastOnActivatedCallTime = new Date().getTime();
    }
    this._wasmService.passArray2dToWasm(
      EventType.TABS_ON_ACTIVATED,
      this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
      tabsToPass,
      HeapType.HEAPF64
    );
  }
}
