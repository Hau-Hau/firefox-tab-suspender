import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register()
class IListener {
  run () {
    throw new TypeError('Method not implemented.');
  }
}
