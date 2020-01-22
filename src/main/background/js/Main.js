import Injector from '~/main/background/js/infrastructure/injector/Injector';
import SettingsRepository
  from '~/main/background/js/core/data/repositories/SettingsRepository';
import TabService from '~/main/background/js/core/services/TabService';
import WasmService from '~/main/background/js/core/services/WasmService';
import TabsOnActivatedListener
  from '~/main/background/js/core/listeners/TabsOnActivatedListener';
import TabsOnCreatedListener
  from '~/main/background/js/core/listeners/TabsOnCreatedListener';
import TabsOnRemovedListener
  from '~/main/background/js/core/listeners/TabsOnRemovedListener';
import TabsOnUpdatedListener
  from '~/main/background/js/core/listeners/TabsOnUpdatedListener';
import WindowsOnCreatedListener
  from '~/main/background/js/core/listeners/WindowsOnCreatedListener';
import WindowsOnRemovedListener
  from '~/main/background/js/core/listeners/WindowsOnRemovedListener';
import IntervalService
  from '~/main/background/js/core/services/IntervalService';
import ContextProvider from '~/main/background/js/core/providers/ContextProvider';
import ContextMenuListener
  from '~/main/background/js/core/listeners/ContextMenuListener';

browser.storage.local.get({
  automaticSuspend: true,
  discardedPageDarkTheme: false,
  loadingTabsImmediately: false,
  neverSuspendPinned: true,
  neverSuspendPlayingAudio: true,
  neverSuspendUnsavedFormInput: true,
  suspendAllOptionInContextMenu: true,
  suspendLeftAndRightOptionsInContextMenu: true,
  suspendOptionInContextMenu: true,
  suspendOthersOptionInContextMenu: true,
  timeToDiscard: 60,
}).then((value) => {
  Injector.get(SettingsRepository).dataSource = value;
  // eslint-disable-next-line spaced-comment
  //= ../.tmp/service.js
  Injector.get(ContextProvider).module = Module;
  Module.onRuntimeInitialized = () => {
    Module.jsChromeTabsDiscard = Injector.get(TabService).discardTab.bind(Injector.get(TabService));
    Module.jsClearInterval = Injector.get(IntervalService).clearInterval.bind(Injector.get(IntervalService));
    Module.jsExpiredTabsWatcher = Injector.get(IntervalService).expiredTabsWatcher.bind(Injector.get(IntervalService));

    Injector.get(ContextMenuListener).run();

    if (!Injector.get(SettingsRepository).automaticSuspend) {
      return;
    }

    Injector.get(WasmService).initializeWasm();
    Injector.get(TabService).initializeTabs();
    Injector.get(TabsOnActivatedListener).run();
    Injector.get(TabsOnCreatedListener).run();
    Injector.get(TabsOnRemovedListener).run();
    Injector.get(TabsOnUpdatedListener).run();
    Injector.get(WindowsOnCreatedListener).run();
    Injector.get(WindowsOnRemovedListener).run();
  };
});
