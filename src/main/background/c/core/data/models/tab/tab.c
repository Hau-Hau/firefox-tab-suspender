#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <time.h>
#include "tab.h"

static struct Tab* constructor(uint32_t id, uint32_t windowId, bool active, bool discarded, bool pinned, bool audible) {
  struct Tab* self = malloc(sizeof(struct Tab));
  self->id = id;
  self->windowId = windowId;
  self->active = active;
  self->discarded = discarded;
  self->pinned = pinned;
  self->audible = audible;
  self->lastUsageTime = (double) time(NULL);
  return self;
}

static void destructor(struct Tab* self) {
  free(self);
}

tab_namespace const Tab = { constructor, destructor };
