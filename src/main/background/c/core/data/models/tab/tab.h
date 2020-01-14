#ifndef FTS_TAB_H
#define FTS_TAB_H

struct Tab {
  uint32_t id;

  uint32_t windowId;

  bool active;

  bool discarded;

  bool pinned;

  bool audible;

  double lastUsageTime;
};

typedef struct {
  struct Tab* (*const constructor)(uint32_t id, uint32_t windowId, bool active, bool discarded, bool pinned,
                                   bool audible);

  void (*const destructor)(struct Tab* self);
} tab_namespace;

extern tab_namespace const Tab;

#endif