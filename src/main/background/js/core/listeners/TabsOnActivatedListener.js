import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabsOnActivatedAction
  from '~/main/background/js/core/actions/TabsOnActivatedAction';
import LoadTabImmediatelyAction
  from '~/main/background/js/core/actions/LoadTabImmediatelyAction';

export default @Injector.register([LoadTabImmediatelyAction, TabsOnActivatedAction])
class TabsOnActivatedListener {
  constructor (loadTabImmediatelyAction, tabsOnActivatedAction) {
    this._loadTabImmediatelyAction = loadTabImmediatelyAction;
    this._tabsOnActivatedAction = tabsOnActivatedAction;
  }

  run () {
    browser.tabs.onActivated.addListener((activeInfo) => {
      this._loadTabImmediatelyAction.run(activeInfo.tabId);
      this._tabsOnActivatedAction.run();
    });
  }
}
