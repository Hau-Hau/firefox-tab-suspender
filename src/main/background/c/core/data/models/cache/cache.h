#ifndef FTS_CACHE_H
#define FTS_CACHE_H

#include "../../../../infrastructure/libs/vector/vector.h"

struct Cache {
  struct Vector windows;

  struct Vector events;
};

typedef struct {
  struct Cache* (*const constructor)();

  void (*const destructor)(struct Cache* self);
} cache_namespace;

extern cache_namespace const Cache;

#endif