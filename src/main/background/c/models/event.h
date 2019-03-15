#ifndef FTS_EVENT_H
#define FTS_EVENT_H

#include <stdint.h>

struct Event {
    uint32_t eventId;
    uint32_t *buffer1D;
    uint32_t bufferSize1D;
    double **buffer2D;
    uint32_t bufferSize2D;
    uint32_t segmentSize2D;
};

#endif

