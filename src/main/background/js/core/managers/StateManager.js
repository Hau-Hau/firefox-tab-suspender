import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register([], x => x.inSingletonScope())
class StateManager {
  constructor () {
    this._module = null;
    this._interval = null;
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
}
