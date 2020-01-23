import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import RestorePageAction
  from '~/main/background/js/core/actions/RestorePageAction';
import RuntimeActionType
  from '~/main/background/js/core/data/RuntimeActionType';

export default @Injector.register([RestorePageAction])
class RuntimeOnMessage {
  constructor (restorePageAction) {
    this._restorePageAction = restorePageAction;
  }

  run () {
    browser.runtime.onMessage.addListener((request, sender) => {
      switch (request.action) {
      case RuntimeActionType.RESTORE_PAGE:
        this._restorePageAction.run(sender.tab.id, request.url);
        break;
      }
    });
  }
}
