import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';

export default @Injector.register([TabService])
class ContextMenuSuspendAllAction {
  constructor (tabService) {
    this._tabService = tabService;
  }

  async run () {
    const tabs = await browser.tabs.query({});
    let index = tabs.length;
    while (index--) {
      this._tabService.discardTab(tabs[index].id, true);
    }
  }
}
