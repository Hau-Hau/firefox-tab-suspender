import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import WindowsOnCreatedAction
  from '~/main/background/js/core/actions/WindowsOnCreatedAction';

export default @Injector.register([WindowsOnCreatedAction])
class WindowsOnCreatedListener {
  constructor (windowsOnCreatedAction) {
    this._windowsOnCreatedAction = windowsOnCreatedAction;
  }

  run () {
    browser.windows.onCreated.addListener(window => this._windowsOnCreatedAction.run(window.id));
  }
}
