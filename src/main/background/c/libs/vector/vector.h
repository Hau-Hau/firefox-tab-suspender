#ifndef FTS_VECTOR_H
#define FTS_VECTOR_H

#include <stdint.h>
#include <stdbool.h>

struct Vector {
  void **items;

  uint32_t size;

  uint32_t capacity;
};

typedef struct {
  struct Vector (*const constructor)();

  void (*const deconstructor)(struct Vector self);

  void (*const push)(struct Vector *self, void **value, bool allowDuplicates);

  void (*const splice)(struct Vector *self, uint32_t index, bool shouldFreePointer);
  int32_t (*const getIndex)(struct Vector self, void *item);
} vector_namespace;

extern vector_namespace const Vector;

#endif
