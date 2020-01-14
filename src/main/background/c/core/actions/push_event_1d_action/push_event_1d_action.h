#ifndef FTS_PUSH_EVENT_1D_ACTION_H
#define FTS_PUSH_EVENT_1D_ACTION_H

typedef struct {
  void (*const run)(const uint32_t eventId, uint32_t* buffer, uint32_t bufferSize);
} push_event_1d_action_namespace;

extern push_event_1d_action_namespace const PushEvent1dAction;

#endif
