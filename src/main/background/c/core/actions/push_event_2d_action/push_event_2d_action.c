#include <stdint.h>
#include "../../data/models/event/event.h"
#include "../../services/event_loop_service/event_loop_service.h"
#include "push_event_2d_action.h"

static void run(const uint32_t eventId, double** buffer, uint32_t bufferSize, const uint32_t segmentSize) {
  struct Event* event = Event.constructor(eventId);
  event->buffer2D = buffer;
  event->bufferSize2D = bufferSize;
  event->segmentSize2D = segmentSize;

  EventLoopService.pushEventToEventQueue(event);
}

push_event_2d_action_namespace const PushEvent2dAction = { run };
