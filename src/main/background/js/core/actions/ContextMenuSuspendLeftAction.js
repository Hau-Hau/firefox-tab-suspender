import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';
import IAction from '~/main/background/js/infrastructure/parents/IAction';

export default @Injector.register([TabService, SettingsRepository])
class ContextMenuSuspendLeftAction extends IAction {
  constructor (tabService, settingsRepository) {
    super();
    this._tabService = tabService;
    this._settingsRepository = settingsRepository;
  }

  async run (tabId, windowId) {
    const tabs = await browser.tabs.query({windowId});

    let startSuspending = false;
    let index = tabs.length;
    while (index--) {
      if (tabs[index].id === tabId) {
        startSuspending = true;
        continue;
      }

      if (startSuspending === false ||
        this._settingsRepository.neverSuspendPlayingAudio && tabs[index].audible ||
        this._settingsRepository.neverSuspendPinned && tabs[index].pinned) {
        continue;
      }
      this._tabService.discardTab(tabs[index].id, true);
    }
  }
}
