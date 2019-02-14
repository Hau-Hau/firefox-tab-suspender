#ifndef FTS_DYNAMIC_ARRAY_H
#define FTS_DYNAMIC_ARRAY_H

#include <stdint.h>
#include <stdbool.h>

struct DynamicArray {
    void **array;

    uint32_t size;

    uint32_t capacity;
};

typedef struct {
    void (*const constructor)(struct DynamicArray *self);

    void (*const push)(struct DynamicArray *self, void **value);

    void (*const splice)(struct DynamicArray *self, uint32_t index, bool shouldFreePointer);
} dynamic_array_namespace;

extern dynamic_array_namespace const DynamicArrayOps;

#endif
