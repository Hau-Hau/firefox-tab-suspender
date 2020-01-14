#include <stdbool.h>
#include <stdint.h>
#include "../../../infrastructure/libs/vector/vector.h"
#include "../../../infrastructure/providers/javascript_functions_provider/javascript_functions_provider.h"
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

  struct Vector events = CacheRepository.getEvents();

  struct Event* event = CacheRepository.getEvents().items[0];
  CacheRepository.removeEvent(0, false);

  if (event->eventType == DISCARD_TABS && events.size > 1) {
    Event.destructor(event);
    event = NULL;
    struct Event* lastEvent = events.items[events.size - 1];
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

  if (events.size == 0) {
    MyIsEventLoopWorking = false;
    return;
  }
  myProcessEvent();
}

static uint32_t myGetIndexByEventType(EventType eventType) {
  uint32_t index = CacheRepository.getEvents().size;
  while (index--) {
    struct Event* event = CacheRepository.getEvents().items[index];
    if (event->eventType == eventType) {
      return index;
    }
  }
  return -1;
}

static void myRemoveEventDuplicates(EventType eventType) {
  struct Vector events = CacheRepository.getEvents();

  uint32_t count = 0;
  uint32_t index = events.size;
  while (index--) {
    struct Event* event = events.items[index];
    if (event->eventType == eventType) {
      count = count + 1;
    }
  }

  if (count <= 1) {
    return;
  }

  index = CacheRepository.getEvents().size;
  while (index--) {
    struct Event* event = events.items[index];
    if (event->eventType == eventType) {
      Vector.splice(&events, index, true);
      count = count - 1;
      if (count == 1) {
        return;
      }
    }
  }
}

static void pushEventToEventQueue(struct Event* event) {
//  if (event->eventType == DISCARD_TABS || event->eventType == TABS_ON_ACTIVATED) {
//    myRemoveEventDuplicates(event->eventType);
//    uint32_t sameEventIndex = myGetIndexByEventType(event->eventType);
//    if (sameEventIndex != -1) {
//      struct Event* oldEvent = CacheRepository.getEvents().items[sameEventIndex];
//      Event.destructor(oldEvent);
//      oldEvent = NULL;
//      CacheRepository.getEvents().items[sameEventIndex] = event;
//    } else {
//      Vector.push(CacheRepository.getEvents(), (void**) &event, true);
//    }
//  } else {
//    Vector.push(CacheRepository.getEvents(), (void**) &event, true);
//  }
  CacheRepository.pushEvent((void**) &event, true);
  if (!MyIsEventLoopWorking) {
    myProcessEvent();
  }
}

event_loop_service_namespace const EventLoopService = { pushEventToEventQueue, isEventLoopWorking };
