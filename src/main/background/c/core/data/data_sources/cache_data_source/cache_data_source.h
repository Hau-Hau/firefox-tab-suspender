#ifndef FTS_CACHE_DATA_SOURCE_H
#define FTS_CACHE_DATA_SOURCE_H

typedef struct {
  void (*const initialize)();

  struct Cache* (*const getCache)();
} cache_data_source_namespace;

extern cache_data_source_namespace const CacheDataSource;

#endif
