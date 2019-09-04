#ifndef FTS_WINDOW_H
#define FTS_WINDOW_H

#include <stdint.h>
#include "../libs/vector/vector.h"

struct Window {
    uint32_t id;
    struct Vector tabs;
};

#endif

