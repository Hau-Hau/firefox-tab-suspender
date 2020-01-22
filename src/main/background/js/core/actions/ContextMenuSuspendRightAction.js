import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';
import IAction from '~/main/background/js/infrastructure/parents/IAction';

export default @Injector.register([TabService])
class ContextMenuSuspendRightAction extends IAction {
  constructor (tabService) {
    super();
    this._tabService = tabService;
  }

  async run (tabId, windowId) {
    const tabs = await browser.tabs.query({windowId});
    let index = tabs.length;
    while (index--) {
      if (tabs[index].id === tabId) {
        break;
      }
      this._tabService.discardTab(tabs[index].id, true);
    }
  }
}
