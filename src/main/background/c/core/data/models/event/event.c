#include <stdint.h>
#include <stdlib.h>
#include "event.h"

static struct Event* constructor(uint32_t id) {
  struct Event* self = malloc(sizeof(struct Event));
  self->eventType = id;
  return self;
}

static void destructor(struct Event* self) {
  free(self);
}

event_namespace const Event = { constructor, destructor };
