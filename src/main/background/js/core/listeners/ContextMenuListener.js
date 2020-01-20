import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import ContextMenuActionType
  from '~/main/background/js/core/data/ContextMenuActionType';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';

export default @Injector.register([SettingsRepository])
class ContextMenuListener {
  constructor (settingsRepository) {
    this._settingsRepository = settingsRepository;
  }

  run () {
    browser.menus.remove(ContextMenuActionType.suspend);
    browser.menus.remove(ContextMenuActionType.suspendOthers);
    browser.menus.remove(ContextMenuActionType.suspendLeft);
    browser.menus.remove(ContextMenuActionType.suspendRight);
    browser.menus.remove(ContextMenuActionType.suspendAll);

    if (this._settingsRepository.suspendOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.suspend,
        title: 'Suspend',
      });
    }

    if (this._settingsRepository.suspendOthersOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.suspendOthers,
        title: 'Suspend Others',
      });
    }

    if (this._settingsRepository.suspendLeftAndRightOptionsInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.suspendLeft,
        title: 'Suspend All to the Left',
      });

      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.suspendRight,
        title: 'Suspend All to the Right',
      });
    }

    if (this._settingsRepository.suspendAllOptionInContextMenu) {
      browser.menus.create({
        contexts: ['tab'],
        id: ContextMenuActionType.suspendAll,
        title: 'Suspend All',
      });
    }

    browser.menus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === ContextMenuActionType.suspend) {
        Module.jsChromeTabsDiscard(tab.id, true);
      }

      if (info.menuItemId === ContextMenuActionType.suspendOthers) {
        browser.tabs.query({windowId: tab.windowId}, (tabs) => {
          let index = tabs.length;
          while (index--) {
            if (tabs[index].id === tab.id) {
              continue;
            }
            Module.jsChromeTabsDiscard(tabs[index].id, true);
          }
        });
      }

      if (info.menuItemId === ContextMenuActionType.suspendLeft) {
        browser.tabs.query({windowId: tab.windowId}, (tabs) => {
          let startSuspending = false;
          let index = tabs.length;
          while (index--) {
            if (tabs[index].id === tab.id) {
              startSuspending = true;
              continue;
            }
            if (startSuspending === false) {
              continue;
            }
            if (value.neverSuspendPlayingAudio && tabs[index].audible ||
            value.neverSuspendPinned && tabs[index].pinned) {
              continue;
            }
            Module.jsChromeTabsDiscard(tabs[index].id, true);
          }
        });
      }

      if (info.menuItemId === ContextMenuActionType.suspendRight) {
        browser.tabs.query({windowId: tab.windowId}, (tabs) => {
          let index = tabs.length;
          while (index--) {
            if (tabs[index].id === tab.id) {
              break;
            }
            Module.jsChromeTabsDiscard(tabs[index].id, true);
          }
        });
      }

      if (info.menuItemId === ContextMenuActionType.suspendAll) {
        browser.tabs.query({}, (tabs) => {
          let index = tabs.length;
          while (index--) {
            Module.jsChromeTabsDiscard(tabs[index].id, true);
          }
        });
      }
    });
  }
}
