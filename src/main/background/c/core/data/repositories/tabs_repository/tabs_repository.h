#ifndef FTS_TABS_REPOSITORY_H
#define FTS_TABS_REPOSITORY_H

typedef struct {
  struct Tab* (*const getTabById)(int32_t id);

  struct Tab* (*const getTabByIdAndWindowId)(int32_t tabId, int32_t windowId);

  struct Vector (*const getAllTabs)();

  struct Vector (*const getNotDiscardedTabs)(bool includeActiveTabs);

  struct Vector (*const getTabsToDiscard)();
} tabs_repository_namespace;

extern tabs_repository_namespace const TabsRepository;

#endif
