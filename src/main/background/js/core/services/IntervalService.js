import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import StateManager from '~/main/background/js/core/managers/StateManager';
import CFunctionsProvider from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register(
  [StateManager, CFunctionsProvider],
  x => x.inSingletonScope()
)
class IntervalService {
  constructor (stateManager, cFunctionsProvider) {
    this._stateManager = stateManager;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  expiredTabsWatcher () {
    if (this._stateManager.interval != null) {
      return;
    }

    this._stateManager.interval = setInterval(() => {
      if (!this._cFunctionsProvider.cIsAbleToPushEvent(EventType.DISCARD_TABS)) {
        return;
      }

      this._cFunctionsProvider.cPushEvent(EventType.DISCARD_TABS);
    }, 2000);
  }

  clearInterval () {
    clearInterval(this._stateManager.interval);
    this._stateManager.interval = null;
  }
}
