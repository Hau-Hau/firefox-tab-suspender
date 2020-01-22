import browser from 'webextension-polyfill';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import IListener from '~/main/background/js/infrastructure/parents/IListener';
import WindowsOnRemovedAction
  from '~/main/background/js/core/actions/WindowsOnRemovedAction';

export default @Injector.register([WindowsOnRemovedAction])
class WindowsOnRemovedListener extends IListener {
  constructor (windowsOnRemovedAction) {
    super();
    this._windowsOnRemovedAction = windowsOnRemovedAction;
  }

  run () {
    browser.windows.onRemoved.addListener(windowId => this._windowsOnRemovedAction.run(windowId));
  }
}
