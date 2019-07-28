#ifndef FTS_SERVICE_CACHE_H
#define FTS_SERVICE_CACHE_H

#include "../../libs/vector/vector.h"

typedef struct {
    void (*const initialize)();

    struct Vector *(*const getWindows)();

    struct Vector *(*const getLoadedTabs)();

    struct Vector *(*const getEvents)();
} cache_service_namespace;

extern cache_service_namespace const CacheService;

#endif

