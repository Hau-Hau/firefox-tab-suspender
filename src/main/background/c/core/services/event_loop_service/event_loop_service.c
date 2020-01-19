#include <stdbool.h>
#include <stdint.h>
#include "../../../infrastructure/libs/vector/vector.h"
#include "../../data/models/event/event.h"
#include "../../data/models/event_type.h"
#include "../../data/repositories/cache_repository/cache_repository.h"
#include "../events_service/events_service.h"
#include "event_loop_service.h"

static bool MyIsEventLoopWorking = false;

static bool isEventLoopWorking() {
  return MyIsEventLoopWorking;
}

static void myProcessEvent() {
  if (MyIsEventLoopWorking || CacheRepository.getEvents().size == 0) {
    MyIsEventLoopWorking = false;
    return;
  }
  MyIsEventLoopWorking = true;

  struct Event* event = CacheRepository.getEvents().items[0];
  CacheRepository.removeEvent(0, false);

  if (event->eventType == DISCARD_TABS && CacheRepository.getEvents().size > 1) {
    Event.destructor(event);
    event = NULL;
    struct Event* lastEvent = CacheRepository.getEvents().items[CacheRepository.getEvents().size - 1];
    if (lastEvent->eventType != DISCARD_TABS) {
      struct Event* discardEvent = Event.constructor(DISCARD_TABS);
      CacheRepository.pushEvent((void**) &discardEvent, true);
    }
    myProcessEvent();
    return;
  }

  switch (event->eventType) {
  case TABS_ON_ACTIVATED:
    EventsService.tabsOnActivatedHandle((const double**) event->buffer2D, event->bufferSize2D);
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

  Event.destructor(event);
  event = NULL;

  if (CacheRepository.getEvents().size == 0) {
    MyIsEventLoopWorking = false;
    return;
  }
  myProcessEvent();
}

static void pushEventToEventQueue(struct Event* event) {
  CacheRepository.pushEvent((void**) &event, true);
  if (!MyIsEventLoopWorking) {
    myProcessEvent();
  }
}

event_loop_service_namespace const EventLoopService = { pushEventToEventQueue, isEventLoopWorking };
