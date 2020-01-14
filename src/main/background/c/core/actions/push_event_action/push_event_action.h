#ifndef FTS_PUSH_EVENT_ACTION_H
#define FTS_PUSH_EVENT_ACTION_H

typedef struct {
  void (*const run)(const uint32_t eventId);
} push_event_action_namespace;

extern push_event_action_namespace const PushEventAction;

#endif
