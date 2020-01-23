import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register([])
class RestorePageAction {
  run (tabId, url) {
    browser.tabs.update(Number(tabId), {
      loadReplace: true,
      url,
    });
  }
}
