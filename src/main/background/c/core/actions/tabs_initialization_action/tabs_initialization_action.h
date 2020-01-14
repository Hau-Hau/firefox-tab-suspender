#ifndef FTS_TABS_INITIALIZATION_ACTION_H
#define FTS_TABS_INITIALIZATION_ACTION_H

typedef struct {
  void (*const run)(const uint32_t** buffer, uint32_t bufferSize, const uint32_t segmentSize);
} tabs_initialization_action_namespace;

extern tabs_initialization_action_namespace const TabsInitializationAction;

#endif
