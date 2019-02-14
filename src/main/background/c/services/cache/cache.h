#ifndef FTS_CACHE_H
#define FTS_CACHE_H

#include "../../models/dynamic_array.h"

typedef struct {
    void (*const initialize)();

    struct DynamicArray *(*const getWindows)();

    struct DynamicArray *(*const getLoadedTabs)();

    struct DynamicArray *(*const getEvents)();
} cache_namespace;

extern cache_namespace const Cache;

#endif
