#ifndef FTS_WINDOW_H
#define FTS_WINDOW_H

#include <stdint.h>

struct Window {
  uint32_t id;
  struct Tab **tabs;
  uint32_t tabsSize;
  uint32_t tabsCapacity;
};

#endif
