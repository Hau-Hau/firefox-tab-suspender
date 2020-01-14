#include <stdlib.h>
#include "../../../../infrastructure/libs/vector/vector.h"
#include "cache.h"

static struct Cache* constructor() {
  struct Cache* self = malloc(sizeof(struct Cache));
  self->windows = Vector.constructor();
  self->events = Vector.constructor();

  return self;
}

static void destructor(struct Cache* self) {
  Vector.destructor(self->windows);
  Vector.destructor(self->events);
  free(self);
}

cache_namespace const Cache = { constructor, destructor };
