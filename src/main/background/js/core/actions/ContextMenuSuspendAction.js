import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';

export default @Injector.register([TabService])
class ContextMenuSuspendAction {
  constructor (tabService) {
    this._tabService = tabService;
  }

  async run (tabId) {
    this._tabService.discardTab(tabId, true);
  }
}
