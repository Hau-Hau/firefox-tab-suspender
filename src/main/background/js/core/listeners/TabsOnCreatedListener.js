import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabsOnCreatedAction
  from '~/main/background/js/core/actions/TabsOnCreatedAction';

export default @Injector.register([TabsOnCreatedAction])
class TabsOnCreatedListener {
  constructor (tabsOnCreatedAction) {
    this._tabsOnCreatedAction = tabsOnCreatedAction;
  }

  run () {
    browser.tabs.onCreated.addListener(tab => this._tabsOnCreatedAction.run(tab.id));
  }
}
