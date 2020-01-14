#ifndef FTS_ARRAY_SERVICE_H
#define FTS_ARRAY_SERVICE_H

typedef struct {
  void (*const swap)(void** a, void** b);

  void (*const push)(void** array, void** value, uint32_t* size, uint32_t* capacity, bool allowDuplicates);

  void (*const splice)(void** array, uint32_t index, uint32_t* size, bool shouldFreePointer);
} array_service_namespace;

extern array_service_namespace const ArrayService;

#endif
