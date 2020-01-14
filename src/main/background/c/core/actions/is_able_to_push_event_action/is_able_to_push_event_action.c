#include <stdint.h>
#include "../../../infrastructure/libs/vector/vector.h"
#include "../../data/models/event/event.h"
#include "../../data/repositories/cache_repository/cache_repository.h"
#include "is_able_to_push_event_action.h"

static int run(const uint8_t eventId) {
  return (int) CacheRepository.getEvents().size == 0
      || ((struct Event *) CacheRepository.getEvents().items[CacheRepository.getEvents().size - 1])->eventType != eventId;
}


is_able_to_push_event_action_namespace const IsAbleToPushEventAction = { run };
