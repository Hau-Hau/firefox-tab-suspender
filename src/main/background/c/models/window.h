#ifndef FTS_WINDOW_H
#define FTS_WINDOW_H

#include <stdint.h>
#include "dynamic_array.h"

struct Window {
    uint32_t id;
    struct DynamicArray tabs;
};

#endif
