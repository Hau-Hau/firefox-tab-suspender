#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "cache.h"
#include "../../utils/vector/vector.h"
#include "../../models/window.h"
#include "../../models/tab.h"
#include "../../models/event.h"

static struct Vector *windows;

static struct Vector *loadedTabs;

static struct Vector *events;

static void initialize() {
    windows = malloc(sizeof(struct Vector));
    loadedTabs = malloc(sizeof(struct Vector));
    events = malloc(sizeof(struct Vector));

    VectorOps.constructor(windows);

    VectorOps.constructor(loadedTabs);

    VectorOps.constructor(events);
}

static struct Vector *getWindows() {
    return windows;
}

static struct Vector *getLoadedTabs() {
    return loadedTabs;
}

static struct Vector *getEvents() {
    return events;
}

cache_namespace const Cache = {
    initialize,
    getWindows,
    getLoadedTabs,
    getEvents
};
