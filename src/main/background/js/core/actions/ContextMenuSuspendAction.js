import Injector from '~/main/background/js/infrastructure/injector/Injector';
import TabService from '~/main/background/js/core/services/TabService';
import IAction from '~/main/background/js/infrastructure/parents/IAction';

export default @Injector.register([TabService])
class ContextMenuSuspendAction extends IAction {
  constructor (tabService) {
    super();
    this._tabService = tabService;
  }

  run (tabId) {
    this._tabService.discardTab(tabId, true);
  }
}
