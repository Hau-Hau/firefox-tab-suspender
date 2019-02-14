#ifndef FTS_VECTOR_H
#define FTS_VECTOR_H

#include <stdint.h>
#include <stdbool.h>

struct Vector {
    void **array;

    uint32_t size;

    uint32_t capacity;
};

typedef struct {
    void (*const constructor)(struct Vector *self);

    void (*const push)(struct Vector *self, void **value);

    void (*const splice)(struct Vector *self, uint32_t index, bool shouldFreePointer);
} dynamic_array_namespace;

extern dynamic_array_namespace const DynamicArrayOps;

#endif
