#ifndef FTS_EVENT_LOOP_H
#define FTS_EVENT_LOOP_H

typedef struct {
    bool (*const isEventLoopWorking)();

    void (*const initialize)();

    void (*const processEvents)(void **array, void **value, uint32_t *size, uint32_t *capacity);
} EventLoop;

#endif
