#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include "event_loop_service.h"
#include "../../models/event.h"
#include "../../models/events.h"
#include "../../libs/vector/vector.h"
#include "../events_service/events_service.h"
#include "../cache_service/cache_service.h"

static bool eventLoopWorking = false;

static bool isEventLoopWorking() {
  return eventLoopWorking;
}

static void processEvent() {
  if (eventLoopWorking || CacheService.getEvents()->size == 0) {
    eventLoopWorking = false;
    return;
  }
  eventLoopWorking = true;

  struct Event *event = CacheService.getEvents()->items[0];
  switch (event->enumEvents) {
    case TABS_ON_ACTIVATED:
      EventsService.tabsOnActivatedHandle((const double **) event->buffer2D, event->bufferSize2D);
      break;
    case WINDOWS_ON_CREATED:
      EventsService.windowsOnCreatedHandle(event->buffer1D);
      break;
    case WINDOWS_ON_REMOVED:
      EventsService.windowsOnRemovedHandle(event->buffer1D);
      break;
    case TABS_ON_CREATED:
      EventsService.tabsOnCreatedHandle(event->buffer1D, event->bufferSize1D);
      break;
    case TABS_ON_UPDATED:
      EventsService.tabsOnUpdatedHandle(event->buffer1D);
      break;
    case TABS_ON_REMOVED:
      EventsService.tabsOnRemovedHandle(event->buffer1D);
      break;
    case DISCARD_TABS:
      EventsService.discardTabs();
  }

  Vector.splice(CacheService.getEvents(), 0, true);

  if (CacheService.getEvents()->size == 0) {
    eventLoopWorking = false;
    return;
  }
  processEvent();
}

event_loop_service_namespace const EventLoopService = {
    isEventLoopWorking,
    processEvent
};
