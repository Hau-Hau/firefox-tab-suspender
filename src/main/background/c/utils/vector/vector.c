#include <stdio.h>
#include <malloc.h>
#include <stdint.h>
#include <stdbool.h>
#include "../array_utils/array_utils.h"
#include "vector.h"

#define INITIAL_SIZE 32

static void constructor(struct Vector *self) {
    self->size = 0;
    self->capacity = INITIAL_SIZE;
    self->array = malloc(self->capacity * sizeof(void *));
}

static void push(struct Vector *self, void **value) {
    ArrayUtils.push(self->array, value, &self->size, &self->capacity);
}

static void splice(struct Vector *self, uint32_t index, bool shouldFreePointer) {
    ArrayUtils.splice(self->array, index, &self->size, shouldFreePointer);
}

dynamic_array_namespace const DynamicArrayOps = {
        constructor,
        push,
        splice
};
