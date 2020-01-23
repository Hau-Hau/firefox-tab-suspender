import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabsOnRemovedAction
  from '~/main/background/js/core/actions/TabsOnRemovedAction';

export default @Injector.register([TabsOnRemovedAction])
class TabsOnRemovedListener {
  constructor (tabsOnRemovedAction) {
    this._tabsOnRemovedAction = tabsOnRemovedAction;
  }

  run () {
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this._tabsOnRemovedAction.run(tabId, removeInfo.windowId);
    });
  }
}
