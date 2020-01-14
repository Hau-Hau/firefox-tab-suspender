#ifndef FTS_EVENT_H
#define FTS_EVENT_H

#include "../event_type.h"

struct Event {
  EventType eventType;

  uint32_t* buffer1D;

  uint32_t bufferSize1D;

  double** buffer2D;

  uint32_t bufferSize2D;

  uint32_t segmentSize2D;
};

typedef struct {
  struct Event* (*const constructor)(uint32_t id);

  void (*const destructor)(struct Event* self);
} event_namespace;

extern event_namespace const Event;

#endif
