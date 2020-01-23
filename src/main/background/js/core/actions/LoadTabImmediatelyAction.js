import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';

export default @Injector.register([SettingsRepository])
class LoadTabImmediatelyAction {
  constructor (settingsRepository) {
    this._settingsRepository = settingsRepository;
  }

  async run (tabId) {
    if (!this._settingsRepository.loadingTabsImmediately) {
      return;
    }

    const tab = await browser.tabs.get(tabId);
    if (tab.title.indexOf('- discarded') <= 1) {
      return;
    }

    const urlObject = new URL(tab.url);
    const url = urlObject.searchParams.get('u');
    browser.tabs.update(tab.id, {
      loadReplace: true,
      url,
    });
  }
}
