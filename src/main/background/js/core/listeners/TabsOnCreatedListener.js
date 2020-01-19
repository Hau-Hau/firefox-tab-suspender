import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import WasmService from '~/main/background/js/core/services/WasmService';
import EventType from '~/main/background/js/core/data/EventType';
import HeapType from '~/main/background/js/core/data/HeapType';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register([WasmService, CFunctionsProvider])
class TabsOnCreatedListener {
  constructor (wasmService, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  run () {
    browser.tabs.onCreated.addListener((tab) => {
      // Bugfix - Newly created tabs sometimes return active=false when they are active
      setTimeout(async () => {
        const tabs = await browser.tabs.query({windowId: tab.windowId});
        let index = tabs.length;
        while (index--) {
          if (tabs[index].id === tab.id) {
            this._wasmService.passArrayToWasm(
              EventType.TABS_ON_CREATED,
              this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
              [
                tabs[index].windowId,
                tabs[index].id,
                tabs[index].active & 1,
                tabs[index].title.indexOf('- discarded') > 1 & 1,
                tabs[index].pinned & 1,
                tabs[index].audible & 1,
              ],
              HeapType.HEAP32,
            );

            return;
          }
        }
      }, 250);
    });
  }
}
