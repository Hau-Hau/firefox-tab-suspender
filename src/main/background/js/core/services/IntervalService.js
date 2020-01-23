import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';
import ContextProvider from '~/main/background/js/core/providers/ContextProvider';
import CFunctionsProvider from '~/main/background/js/core/providers/CFunctionsProvider';

export default @Injector.register(
  [ContextProvider, CFunctionsProvider],
  x => x.inSingletonScope()
)
class IntervalService {
  constructor (contextProvider, cFunctionsProvider) {
    this._contextProvider = contextProvider;
    this._cFunctionsProvider = cFunctionsProvider;
  }

  expiredTabsWatcher () {
    if (this._contextProvider.interval != null) {
      return;
    }

    this._contextProvider.interval = setInterval(() => {
      if (!this._cFunctionsProvider.cIsAbleToPushEvent(EventType.DISCARD_TABS)) {
        return;
      }

      this._cFunctionsProvider.cPushEvent(EventType.DISCARD_TABS);
    }, 2000);
  }

  clearInterval () {
    clearInterval(this._contextProvider.interval);
    this._contextProvider.interval = null;
  }
}
