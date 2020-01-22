import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import IListener from '~/main/background/js/infrastructure/parents/IListener';
import TabsOnUpdatedAction
  from '~/main/background/js/core/actions/TabsOnUpdatedAction';

export default @Injector.register([TabsOnUpdatedAction])
class TabsOnUpdatedListener extends IListener {
  constructor (tabsOnUpdatedAction) {
    super();
    this._tabsOnUpdatedAction = tabsOnUpdatedAction;
  }

  run () {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this._tabsOnUpdatedAction.run(tab);
    });
  }
}
