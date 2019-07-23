#ifndef FTS_EVENT_LOOP_SERVICE_H
#define FTS_EVENT_LOOP_SERVICE_H

#include <stdbool.h>

typedef struct {
    bool (*const isEventLoopWorking)();

    void (*const processEvents)();
} event_loop_service_namespace;

extern event_loop_service_namespace const EventLoopService;

#endif

