#ifndef FTS_CACHE_H
#define FTS_CACHE_H

#include "../../utils/vector/vector.h"

typedef struct {
    void (*const initialize)();

    struct Vector *(*const getWindows)();

    struct Vector *(*const getLoadedTabs)();

    struct Vector *(*const getEvents)();
} cache_namespace;

extern cache_namespace const Cache;

#endif

