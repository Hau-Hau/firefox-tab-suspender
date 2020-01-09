#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "services/javascript_provider_service/javascript_provider_service.h"
#include "services/settings_provider_service/settings_provider_service.h"
#include "services/event_loop_service/event_loop_service.h"
#include "services/cache_service/cache_service.h"
#include "services/events_service/events_service.h"
#include "models/event.h"
#include <emscripten.h>

extern void jsExpiredTabsWatcher(void);

extern void jsClearInterval(void);

extern void jsChromeTabsDiscard(uint32_t);

extern void jsConsoleLog(uint32_t);

EMSCRIPTEN_KEEPALIVE void cInitialize(const uint32_t *buffer, uint32_t bufferSize) {
  uint32_t timeToDiscard = buffer[0];
  bool neverSuspendPinned = (bool) buffer[1];
  bool neverSuspendUnsavedFormInput = (bool) buffer[2];
  bool neverSuspendPlayingAudio = (bool) buffer[3];
  bool desaturateFavicon = (bool) buffer[4];

  CacheService.initialize();
  JavaScriptProviderService.initialize(jsExpiredTabsWatcher, jsClearInterval, jsChromeTabsDiscard, jsConsoleLog);
  SettingsProviderService.initialize(
      timeToDiscard,
      neverSuspendPinned,
      neverSuspendUnsavedFormInput,
      neverSuspendPlayingAudio,
      desaturateFavicon
  );
}

EMSCRIPTEN_KEEPALIVE void
cTabsInitialization(const uint32_t **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
  while (bufferSize--) {
    EventsService.tabsOnCreatedHandle(buffer[bufferSize], segmentSize);
  }
  jsExpiredTabsWatcher();
}

EMSCRIPTEN_KEEPALIVE int cAbleToPushEvent(const uint8_t eventId) {
  return (int) CacheService.getEvents()->size == 0
      || ((struct Event *) CacheService.getEvents()->items[CacheService.getEvents()->size - 1])->enumEvents != eventId;
}

EMSCRIPTEN_KEEPALIVE void cPushEvent(const uint32_t eventId) {
  struct Event *event = malloc(sizeof(struct Event));
  event->enumEvents = eventId;
  Vector.push(CacheService.getEvents(), (void **) &event, true);
  if (!EventLoopService.isEventLoopWorking()) {
    EventLoopService.processEvents();
  }
}

EMSCRIPTEN_KEEPALIVE void cPushEvent1D(const uint32_t eventId, uint32_t *buffer, uint32_t bufferSize) {
  struct Event *event = malloc(sizeof(struct Event));
  event->enumEvents = eventId;
  event->buffer1D = buffer;
  event->bufferSize1D = bufferSize;
  Vector.push(CacheService.getEvents(), (void **) &event, true);
  if (!EventLoopService.isEventLoopWorking()) {
    EventLoopService.processEvents();
  }
}

EMSCRIPTEN_KEEPALIVE void
cPushEvent2D(const uint32_t eventId, double **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
  struct Event *event = malloc(sizeof(struct Event));
  event->enumEvents = eventId;
  event->buffer2D = buffer;
  event->bufferSize2D = bufferSize;
  event->segmentSize2D = segmentSize;
  Vector.push(CacheService.getEvents(), (void **) &event, true);
  if (!EventLoopService.isEventLoopWorking()) {
    EventLoopService.processEvents();
  }
}
