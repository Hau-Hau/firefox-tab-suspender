#ifndef FTS_PUSH_EVENT_2D_ACTION_H
#define FTS_PUSH_EVENT_2D_ACTION_H

typedef struct {
  void (*const run)(const uint32_t eventId, double** buffer, uint32_t bufferSize, const uint32_t segmentSize);
} push_event_2d_action_namespace;

extern push_event_2d_action_namespace const PushEvent2dAction;

#endif
