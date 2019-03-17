#ifndef FTS_TAB_H
#define FTS_TAB_H

#include <stdbool.h>
#include <stdint.h>

struct Tab {
    uint32_t id;
    uint32_t windowId;
    bool active;
    bool discarded;
    bool pinned;
    bool audible;
    double lastUsageTime;
};

#endif

