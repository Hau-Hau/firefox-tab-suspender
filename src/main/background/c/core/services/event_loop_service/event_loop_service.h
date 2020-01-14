#ifndef FTS_EVENT_LOOP_SERVICE_H
#define FTS_EVENT_LOOP_SERVICE_H
#include <stdbool.h>

typedef struct {
  void (*const pushEventToEventQueue)(struct Event* event);
  bool (*const isEventLoopWorking)();
} event_loop_service_namespace;

extern event_loop_service_namespace const EventLoopService;

#endif
