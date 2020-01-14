#ifndef FTS_CACHE_REPOSITORY_H
#define FTS_CACHE_REPOSITORY_H

#include <stdbool.h>

typedef struct {
  struct Vector (*const getWindows)();

  struct Vector (*const getEvents)();

  void (*const pushWindow)(void** value);

  void (*const pushEvent)(void** value, bool allowDuplicates);

  void (*const removeWindow)(uint32_t index);

  void (*const removeEvent)(uint32_t index, bool shouldFreePointer);
} cache_repository_namespace;

extern cache_repository_namespace const CacheRepository;

#endif
