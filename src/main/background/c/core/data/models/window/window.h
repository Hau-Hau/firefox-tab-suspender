#ifndef FTS_WINDOW_H
#define FTS_WINDOW_H

#include <stdint.h>
#include <stdlib.h>
#include "../../../../infrastructure/libs/vector/vector.h"

struct Window {
  uint32_t id;

  struct Vector tabs;
};

typedef struct {
  struct Window* (*const constructor)(uint32_t id);

  void (*const destructor)(struct Window* self);
} window_namespace;

extern window_namespace const Window;

#endif
