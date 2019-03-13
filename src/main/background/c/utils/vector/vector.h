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
    void (*const constructor)(struct Vector *self);

    void (*const push)(struct Vector *self, void **value);

    void (*const splice)(struct Vector *self, uint32_t index, bool shouldFreePointer);
} vector_namespace;

extern vector_namespace const Vector;

#endif
