import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import IListener from '~/main/background/js/infrastructure/parents/IListener';
import TabsOnRemovedAction
  from '~/main/background/js/core/actions/TabsOnRemovedAction';

export default @Injector.register([TabsOnRemovedAction])
class TabsOnRemovedListener extends IListener {
  constructor (tabsOnRemovedAction) {
    super();
    this._tabsOnRemovedAction = tabsOnRemovedAction;
  }

  run () {
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this._tabsOnRemovedAction.run(tabId, removeInfo.windowId);
    });
  }
}
