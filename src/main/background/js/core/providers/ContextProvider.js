import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register([], x => x.inSingletonScope())
class ContextProvider {
  constructor () {
    this._module = null;
    this._interval = null;
    this._lastOnActivatedCallTime = null;
  }

  get module () {
    return this._module;
  }

  set module (value) {
    this._module = value;
  }

  get interval () {
    return this._interval;
  }

  set interval (value) {
    this._interval = value;
  }

  get lastOnActivatedCallTime () {
    return this._lastOnActivatedCallTime;
  }

  set lastOnActivatedCallTime (value) {
    this._lastOnActivatedCallTime = value;
  }
}
