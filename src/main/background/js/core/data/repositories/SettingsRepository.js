import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register([], x => x.inSingletonScope())
class SettingsRepository {
  constructor () {
    this._settings = null;
  }

  set dataSource (settings) {
    this._settings = settings;
  }

  get automaticSuspend () {
    return this._settings.automaticSuspend;
  }

  get discardedPageDarkTheme () {
    return this._settings.discardedPageDarkTheme;
  }

  get loadingTabsImmediately () {
    return this._settings.loadingTabsImmediately;
  }

  get neverSuspendPinned () {
    return this._settings.neverSuspendPinned;
  }

  get neverSuspendPlayingAudio () {
    return this._settings.neverSuspendPlayingAudio;
  }

  get neverSuspendUnsavedFormInput () {
    return this._settings.neverSuspendUnsavedFormInput;
  }

  get suspendAllOptionInContextMenu () {
    return this._settings.suspendAllOptionInContextMenu;
  }

  get suspendLeftAndRightOptionsInContextMenu () {
    return this._settings.suspendLeftAndRightOptionsInContextMenu;
  }

  get suspendOptionInContextMenu () {
    return this._settings.suspendOptionInContextMenu;
  }

  get suspendOthersOptionInContextMenu () {
    return this._settings.suspendOthersOptionInContextMenu;
  }

  get timeToDiscard () {
    return this._settings.timeToDiscard;
  }
}
