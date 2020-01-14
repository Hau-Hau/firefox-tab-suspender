#include <stdint.h>
#include "../../../../infrastructure/libs/vector/vector.h"
#include "../../data_sources/cache_data_source/cache_data_source.h"
#include "../../models/cache/cache.h"
#include "cache_repository.h"

static struct Vector getWindows() {
  return CacheDataSource.getCache()->windows;
}

static struct Vector getEvents() {
  return CacheDataSource.getCache()->events;
}

static void pushWindow(void** value) {
  Vector.push(&CacheDataSource.getCache()->windows, value, false);
}

static void pushEvent(void** value, bool allowDuplicates) {
  Vector.push(&CacheDataSource.getCache()->events, value, allowDuplicates);
}

static void removeWindow(uint32_t index) {
  Vector.splice(&CacheDataSource.getCache()->windows, index, true);
}

static void removeEvent(uint32_t index, bool shouldFreePointer) {
  Vector.splice(&CacheDataSource.getCache()->events, index, shouldFreePointer);
}

cache_repository_namespace const CacheRepository = { getWindows, getEvents,    pushWindow,
                                                     pushEvent,  removeWindow, removeEvent };
