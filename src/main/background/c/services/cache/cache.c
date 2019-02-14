#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "cache.h"
#include "../../models/dynamic_array.h"
#include "../../models/window.h"
#include "../../models/tab.h"
#include "../../models/event.h"

static struct DynamicArray *windows;

static struct DynamicArray *loadedTabs;

static struct DynamicArray *events;

static void initialize() {
    windows = malloc(sizeof(struct DynamicArray));
    loadedTabs = malloc(sizeof(struct DynamicArray));
    events = malloc(sizeof(struct DynamicArray));

    DynamicArrayOps.constructor(windows);

    DynamicArrayOps.constructor(loadedTabs);

    DynamicArrayOps.constructor(events);
}

static struct DynamicArray *getWindows() {
    return windows;
}

static struct DynamicArray *getLoadedTabs() {
    return loadedTabs;
}

static struct DynamicArray *getEvents() {
    return events;
}

cache_namespace const Cache = {
    initialize,
    getWindows,
    getLoadedTabs,
    getEvents
};
