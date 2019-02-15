#ifndef FTS_EVENT_LOOP_H
#define FTS_EVENT_LOOP_H

#include <stdbool.h>

typedef struct {
    bool (*const isEventLoopWorking)();

    void (*const processEvents)();
} event_loop_namespace;

extern event_loop_namespace const EventLoop;

#endif
