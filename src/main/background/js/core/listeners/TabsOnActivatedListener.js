import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import WasmService from '~/main/background/js/core/services/WasmService';
import HeapType from '~/main/background/js/core/data/HeapType';
import CFunctionsProvider
  from '~/main/background/js/core/providers/CFunctionsProvider';
import ContextProvider from '~/main/background/js/core/providers/ContextProvider';
import IListener from '~/main/background/js/infrastructure/parents/IListener';
import TabsOnActivatedAction
  from '~/main/background/js/core/actions/TabsOnActivatedAction';

export default @Injector.register([TabsOnActivatedAction])
class TabsOnActivatedListener extends IListener {
  constructor (tabsOnActivatedAction) {
    super();
    this._tabsOnActivatedAction = tabsOnActivatedAction;
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

    browser.tabs.onActivated.addListener(() => this._tabsOnActivatedAction.run());
  }
}
