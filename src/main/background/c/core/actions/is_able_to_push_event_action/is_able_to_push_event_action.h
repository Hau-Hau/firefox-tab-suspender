#ifndef FTS_IS_ABLE_TO_PUSH_EVENT_ACTION_H
#define FTS_IS_ABLE_TO_PUSH_EVENT_ACTION_H

typedef struct {
  int (*const run)(const uint8_t eventId);
} is_able_to_push_event_action_namespace;

extern is_able_to_push_event_action_namespace const IsAbleToPushEventAction;

#endif
