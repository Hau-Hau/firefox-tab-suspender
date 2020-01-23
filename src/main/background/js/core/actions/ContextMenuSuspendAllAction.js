import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';

export default @Injector.register([TabService, SettingsRepository])
class ContextMenuSuspendAllAction {
  constructor (tabService, settingsRepository) {
    this._tabService = tabService;
    this._settingsRepository = settingsRepository;
  }

  async run () {
    const tabs = await browser.tabs.query({});
    let index = tabs.length;
    while (index--) {
      if (this._settingsRepository.neverSuspendPlayingAudio && tabs[index].audible ||
        this._settingsRepository.neverSuspendPinned && tabs[index].pinned) {
        continue;
      }

      this._tabService.discardTab(tabs[index].id, true);
    }
  }
}
