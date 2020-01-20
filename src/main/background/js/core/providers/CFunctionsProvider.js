import Injector from '~/main/background/js/infrastructure/injector/Injector';
import StateManager from '~/main/background/js/core/managers/StateManager';

export default @Injector.register([StateManager])
class CFunctionsProvider {
  constructor (stateManager) {
    this._stateManager = stateManager;
  }

  cWasmInitialization (buffer, bufferSize) {
    this._stateManager.module.cwrap('cWasmInitialization', null, ['number', 'number'])(buffer, bufferSize);
  }

  cTabsInitialization (buffer, bufferSize, segmentSize) {
    this._stateManager.module.cwrap('cTabsInitialization', null, [
      'number',
      'number',
      'number',
    ])(buffer, bufferSize, segmentSize);
  }

  cIsAbleToPushEvent (eventId) {
    return this._stateManager.module.cwrap('cIsAbleToPushEvent', 'number', ['number'])(eventId);
  }

  cPushEvent (eventId, buffer, bufferSize, segmentSize) {
    if (buffer == null && bufferSize == null && segmentSize == null) {
      this._stateManager.module.cwrap('cPushEvent', null, ['number'])(eventId);
    } else if (buffer != null && bufferSize != null && segmentSize == null) {
      this._stateManager.module.cwrap('cPushEvent1D', null, [
        'number',
        'number',
        'number',
      ])(eventId, buffer, bufferSize);
    } else if (buffer != null && bufferSize != null && segmentSize != null) {
      this._stateManager.module.cwrap('cPushEvent2D', null, [
        'number',
        'number',
        'number',
        'number',
      ])(eventId, buffer, bufferSize, segmentSize);
    }
  }
}
