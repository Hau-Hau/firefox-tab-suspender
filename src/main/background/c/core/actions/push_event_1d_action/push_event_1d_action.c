#include <stdint.h>
#include "../../data/models/event/event.h"
#include "../../services/event_loop_service/event_loop_service.h"
#include "push_event_1d_action.h"

static void run(const uint32_t eventId, uint32_t* buffer, uint32_t bufferSize) {
  struct Event* event = Event.constructor(eventId);
  event->buffer1D = buffer;
  event->bufferSize1D = bufferSize;

  EventLoopService.pushEventToEventQueue(event);
}

push_event_1d_action_namespace const PushEvent1dAction = { run };
