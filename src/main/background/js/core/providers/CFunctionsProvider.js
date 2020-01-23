import Injector from '~/main/background/js/infrastructure/injector/Injector';
import ContextProvider from '~/main/background/js/core/providers/ContextProvider';

export default @Injector.register([ContextProvider])
class CFunctionsProvider {
  constructor (contextProvider) {
    this._contextProvider = contextProvider;
  }

  cWasmInitialization (buffer, bufferSize) {
    this._contextProvider.module.cwrap('cWasmInitialization', null, ['number', 'number'])(buffer, bufferSize);
  }

  cTabsInitialization (buffer, bufferSize, segmentSize) {
    this._contextProvider.module.cwrap('cTabsInitialization', null, [
      'number',
      'number',
      'number',
    ])(buffer, bufferSize, segmentSize);
  }

  cIsAbleToPushEvent (eventId) {
    return this._contextProvider.module.cwrap('cIsAbleToPushEvent', 'number', ['number'])(eventId);
  }

  cPushEvent (eventId, buffer, bufferSize, segmentSize) {
    if (buffer == null && bufferSize == null && segmentSize == null) {
      this._contextProvider.module.cwrap('cPushEvent', null, ['number'])(eventId);
    } else if (buffer != null && bufferSize != null && segmentSize == null) {
      this._contextProvider.module.cwrap('cPushEvent1D', null, [
        'number',
        'number',
        'number',
      ])(eventId, buffer, bufferSize);
    } else if (buffer != null && bufferSize != null && segmentSize != null) {
      this._contextProvider.module.cwrap('cPushEvent2D', null, [
        'number',
        'number',
        'number',
        'number',
      ])(eventId, buffer, bufferSize, segmentSize);
    }
  }
}
