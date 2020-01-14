#include <stdint.h>
#include <stdlib.h>
#include "../../../../infrastructure/libs/vector/vector.h"
#include "window.h"

static struct Window* constructor(uint32_t id) {
  struct Window* self = malloc(sizeof(struct Window));
  self->id = id;
  self->tabs = Vector.constructor();
  return self;
}

static void destructor(struct Window* self) {
  free(self);
}

window_namespace const Window = { constructor, destructor };