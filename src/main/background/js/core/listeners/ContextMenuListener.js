import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import ContextMenuActionType
  from '~/main/background/js/core/data/ContextMenuActionType';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';
import ContextMenuSuspendAction
  from '~/main/background/js/core/actions/ContextMenuSuspendAction';
import ContextMenuSuspendOthersAction
  from '~/main/background/js/core/actions/ContextMenuSuspendOthersAction';
import ContextMenuSuspendLeftAction
  from '~/main/background/js/core/actions/ContextMenuSuspendLeftAction';
import ContextMenuSuspendRightAction
  from '~/main/background/js/core/actions/ContextMenuSuspendRightAction';
import ContextMenuSuspendAllAction
  from '~/main/background/js/core/actions/ContextMenuSuspendAllAction';

export default @Injector.register(
  [
    SettingsRepository,
    ContextMenuSuspendAction,
    ContextMenuSuspendOthersAction,
    ContextMenuSuspendLeftAction,
    ContextMenuSuspendRightAction,
    ContextMenuSuspendAllAction,
  ]
)
class ContextMenuListener {
  constructor (
    settingsRepository, contextMenuSuspendAction, contextMenuSuspendOthersAction,
    contextMenuSuspendLeftAction, contextMenuSuspendRightAction, contextMenuSuspendAllAction
  ) {
    this._settingsRepository = settingsRepository;
    this._contextMenuSuspendAction = contextMenuSuspendAction;
    this._contextMenuSuspendOthersAction = contextMenuSuspendOthersAction;
    this._contextMenuSuspendLeftAction = contextMenuSuspendLeftAction;
    this._contextMenuSuspendRightAction = contextMenuSuspendRightAction;
    this._contextMenuSuspendAllAction = contextMenuSuspendAllAction;
    this._setupContextMenuButtons();
  }

  _setupContextMenuButtons () {
    browser.menus.remove(ContextMenuActionType.SUSPEND);
    if (this._settingsRepository.suspendOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.SUSPEND,
        title: 'Suspend',
      });
    }

    browser.menus.remove(ContextMenuActionType.SUSPEND_OTHERS);
    if (this._settingsRepository.suspendOthersOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.SUSPEND_OTHERS,
        title: 'Suspend Others',
      });
    }

    browser.menus.remove(ContextMenuActionType.SUSPEND_LEFT);
    browser.menus.remove(ContextMenuActionType.SUSPEND_RIGHT);
    if (this._settingsRepository.suspendLeftAndRightOptionsInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.SUSPEND_LEFT,
        title: 'Suspend All to the Left',
      });

      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.SUSPEND_RIGHT,
        title: 'Suspend All to the Right',
      });
    }

    browser.menus.remove(ContextMenuActionType.SUSPEND_ALL);
    if (this._settingsRepository.suspendAllOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.SUSPEND_ALL,
        title: 'Suspend All',
      });
    }
  }

  run () {
    browser.menus.onClicked.addListener((info, tab) => {
      switch (info.menuItemId) {
      case ContextMenuActionType.SUSPEND:
        this._contextMenuSuspendAction.run(tab.id);
        break;
      case ContextMenuActionType.SUSPEND_OTHERS:
        this._contextMenuSuspendOthersAction.run(tab.id, tab.windowId);
        break;
      case ContextMenuActionType.SUSPEND_LEFT:
        this._contextMenuSuspendLeftAction.run(tab.id, tab.windowId);
        break;
      case ContextMenuActionType.SUSPEND_RIGHT:
        this._contextMenuSuspendRightAction.run(tab.id, tab.windowId);
        break;
      case ContextMenuActionType.SUSPEND_ALL:
        this._contextMenuSuspendAllAction.run();
        break;
      }
    });
  }
}
