#ifndef FTS_EVENT_H
#define FTS_EVENT_H

#include <stdint.h>
#include "./events.h"

struct Event {
    enum Events enumEvents;
    uint32_t *buffer1D;
    uint32_t bufferSize1D;
    double **buffer2D;
    uint32_t bufferSize2D;
    uint32_t segmentSize2D;
};

#endif

