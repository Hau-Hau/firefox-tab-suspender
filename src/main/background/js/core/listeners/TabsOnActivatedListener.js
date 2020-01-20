import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import WasmService from '~/main/background/js/core/services/WasmService';
import HeapType from '~/main/background/js/core/data/HeapType';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';
import StateManager from '~/main/background/js/core/managers/StateManager';

export default @Injector.register([WasmService, StateManager, CFunctionsProvider])
class TabsOnActivatedListener {
  constructor (wasmService, stateManager, cFunctionsProvider) {
    this._wasmService = wasmService;
    this._stateManager = stateManager;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  run () {
    // browser.tabs.onActivated.addListener(async (activeInfo) => {
    //   if (!this._settingsRepository.loadingTabsImmediately) {
    //     // chrome.tabs.get(activeInfo.tabId, function(tab) {
    //     //   if (tab.title.indexOf('- discarded') <= 1) {
    //     //     return;
    //     //   }
    //     //   const urlObj = new URL(tab.url);
    //     //   const url = urlObj.searchParams.get('u');
    //     //   browser.tabs.update(tab.id, {
    //     //     url: url
    //     //   });
    //     //   // TODO push scroll function
    //     // });
    //   }
    //   const tab = await browser.tabs.get(activeInfo.tabId);
    //   if (tab.title.indexOf('- discarded') <= 1) {
    //     return;
    //   }
    //   const urlObject = new URL(tab.url);
    //   const url = urlObject.searchParams.get('u');
    //   browser.tabs.update(tab.id, {
    //     loadReplace: true,
    //     url,
    //   });
    //
    //   // TODO push scroll function
    // });

    browser.tabs.onActivated.addListener(async () => {
      if (this._stateManager.lastOnActivatedCallTime != null &&
        new Date().getTime() - this._stateManager.lastOnActivatedCallTime <= 400) {
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
        this._stateManager.lastOnActivatedCallTime = new Date().getTime();
      }
      console.log(tabsToPass);
      this._wasmService.passArray2dToWasm(
        EventType.TABS_ON_ACTIVATED,
        this._cFunctionsProvider.cPushEvent.bind(this._cFunctionsProvider),
        tabsToPass,
        HeapType.HEAPF64
      );
    });
  }
}
