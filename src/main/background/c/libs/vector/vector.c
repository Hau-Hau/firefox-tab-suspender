#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include "services/array_service/array_service.h"
#include "vector.h"

#define INITIAL_SIZE 32

static struct Vector constructor() {
  struct Vector self;
  self.size = 0;
  self.capacity = INITIAL_SIZE;
  self.items = malloc(self.capacity * sizeof(void *));
  return self;
}

static void deconstructor(struct Vector self) {
  free(self.items);
}

static void push(struct Vector *self, void **value, bool allowDuplicates) {
  ArrayService.push(self->items, value, &self->size, &self->capacity, allowDuplicates);
}

static void splice(struct Vector *self, uint32_t index, bool shouldFreePointer) {
  ArrayService.splice(self->items, index, &self->size, shouldFreePointer);
}

static int32_t getIndex(struct Vector self, void *item) {
  uint32_t index = self.size;
  while (index--) {
    if (self.items[index] == item) {
      return index;
    }
  }
  return -1;
}

vector_namespace const Vector = {
    constructor,
    deconstructor,
    push,
    splice,
    getIndex
};

