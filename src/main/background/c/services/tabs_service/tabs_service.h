#ifndef FTS_TABS_SERVICE_H
#define FTS_TABS_SERVICE_H

typedef struct {
  struct Tab *(*const getTabById)(int32_t id);
  struct Tab *(*const getLoadedTabById)(int32_t id);
  struct Tab *(*const getLoadedTabByIdAndWindowId)(int32_t id, int32_t windowId);
  struct Tab *(*const getTabByIdAndWindowId)(int32_t tabId, int32_t windowId);
  struct Vector (*const getTabsThatShouldBeDiscarded)();

} tabs_service_namespace;

extern tabs_service_namespace const TabsService;

#endif
