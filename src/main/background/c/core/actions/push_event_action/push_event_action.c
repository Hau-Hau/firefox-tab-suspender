#include <stdint.h>
#include "../../data/models/event/event.h"
#include "../../services/event_loop_service/event_loop_service.h"
#include "push_event_action.h"

static void run(const uint32_t eventId) {
  struct Event* event = Event.constructor(eventId);
  EventLoopService.pushEventToEventQueue(event);
}

push_event_action_namespace const PushEventAction = { run };
