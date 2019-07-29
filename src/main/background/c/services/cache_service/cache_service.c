#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include "cache_service.h"
#include "../../models/window.h"

static struct Vector *windows;

static struct Vector *loadedTabs;

static struct Vector *events;

static void initialize() {
  windows = malloc(sizeof(struct Vector));
  loadedTabs = malloc(sizeof(struct Vector));
  events = malloc(sizeof(struct Vector));

  *windows = Vector.constructor();
  *loadedTabs = Vector.constructor();
  *events = Vector.constructor();
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

cache_service_namespace const CacheService = {
    initialize,
    getWindows,
    getLoadedTabs,
    getEvents
};
