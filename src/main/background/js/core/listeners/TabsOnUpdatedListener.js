import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabsOnUpdatedAction
  from '~/main/background/js/core/actions/TabsOnUpdatedAction';

export default @Injector.register([TabsOnUpdatedAction])
class TabsOnUpdatedListener {
  constructor (tabsOnUpdatedAction) {
    this._tabsOnUpdatedAction = tabsOnUpdatedAction;
  }

  run () {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this._tabsOnUpdatedAction.run(changeInfo, tab);
    });
  }
}
