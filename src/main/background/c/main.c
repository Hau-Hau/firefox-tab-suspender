#include <emscripten.h>
#include <stdint.h>
#include "core/actions/wasm_initialization_action/wasm_initialization_action.h"
#include "core/actions/is_able_to_push_event_action/is_able_to_push_event_action.h"
#include "core/actions/push_event_1d_action/push_event_1d_action.h"
#include "core/actions/push_event_2d_action/push_event_2d_action.h"
#include "core/actions/push_event_action/push_event_action.h"
#include "core/actions/tabs_initialization_action/tabs_initialization_action.h"

extern void jsExpiredTabsWatcher(void);

extern void jsClearInterval(void);

extern void jsChromeTabsDiscard(uint32_t);

extern void jsConsoleLog(uint32_t);

EMSCRIPTEN_KEEPALIVE void cWasmInitialization(const uint32_t* buffer, uint32_t bufferSize) {
  WasmInitializationAction.run(buffer, bufferSize, jsExpiredTabsWatcher, jsClearInterval, jsChromeTabsDiscard,
                               jsConsoleLog);
}

EMSCRIPTEN_KEEPALIVE void cTabsInitialization(const uint32_t** buffer, uint32_t bufferSize,
                                              const uint32_t segmentSize) {
  TabsInitializationAction.run(buffer, bufferSize, segmentSize);
}

EMSCRIPTEN_KEEPALIVE int cIsAbleToPushEvent(const uint8_t eventId) {
  return IsAbleToPushEventAction.run(eventId);
}

EMSCRIPTEN_KEEPALIVE void cPushEvent(const uint32_t eventId) {
  PushEventAction.run(eventId);
}

EMSCRIPTEN_KEEPALIVE void cPushEvent1D(const uint32_t eventId, uint32_t* buffer, uint32_t bufferSize) {
  PushEvent1dAction.run(eventId, buffer, bufferSize);
}

EMSCRIPTEN_KEEPALIVE void cPushEvent2D(const uint32_t eventId, double** buffer, uint32_t bufferSize,
                                       const uint32_t segmentSize) {
  PushEvent2dAction.run(eventId, buffer, bufferSize, segmentSize);
}
