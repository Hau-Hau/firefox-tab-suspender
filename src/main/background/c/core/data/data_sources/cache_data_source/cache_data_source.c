#include "cache_data_source.h"
#include "../../models/cache/cache.h"

static struct Cache* MyCache;

static void initialize() {
  MyCache = Cache.constructor();
}

static struct Cache* getCache() {
  return MyCache;
}

cache_data_source_namespace const CacheDataSource = { initialize, getCache };
