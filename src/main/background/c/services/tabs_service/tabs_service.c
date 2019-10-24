#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include "../../libs/vector/vector.h"
#include "../cache_service/cache_service.h"
#include "../settings_provider_service/settings_provider_service.h"
#include "../javascript_provider_service/javascript_provider_service.h"
#include "../../models/window.h"
#include "../../models/tab.h"
#include "tabs_service.h"

static struct Tab *getTabById(int32_t id) {
  uint32_t windowsIndex = CacheService.getWindows()->size;
  while (windowsIndex--) {
    struct Window *window = CacheService.getWindows()->items[windowsIndex];
    uint32_t tabsIndex = window->tabs.size;
    while (tabsIndex--) {
      struct Tab *tab = window->tabs.items[tabsIndex];
      if (tab->id == id) {
        return tab;
      }
    }
  }
  return NULL;
}

static struct Tab *getLoadedTabById(int32_t id) {
  uint32_t index = CacheService.getLoadedTabs()->size;
  while (index--) {
    struct Tab *tab = CacheService.getLoadedTabs()->items[index];
    if (tab->id == id) {
      return tab;
    }
  }
  return NULL;
}

static struct Tab *getLoadedTabByIdAndWindowId(int32_t tabId, int32_t windowId) {
  uint32_t index = CacheService.getLoadedTabs()->size;
  while (index--) {
    struct Tab *tab = CacheService.getLoadedTabs()->items[index];
    if (tab->id == tabId && tab->windowId == windowId) {
      return tab;
    }
  }
  return NULL;
}

static struct Tab *getTabByIdAndWindowId(int32_t tabId, int32_t windowId) {
  struct Window *window = CacheService.getWindows()->items[windowId];
  if (window == NULL) {
    return NULL;
  }

  uint32_t tabsIndex = window->tabs.size;
  while (tabsIndex--) {
    struct Tab *tab = window->tabs.items[tabsIndex];
    if (tab->id == tabId) {
      return tab;
    }
  }
  return NULL;
}

static struct Vector getTabsThatShouldBeDiscarded() {
  struct Vector output = Vector.constructor();

  uint32_t index = CacheService.getLoadedTabs()->size;
  while (index--) {
    struct Tab *tab = CacheService.getLoadedTabs()->items[index];
    if (time(NULL) - tab->lastUsageTime >= SettingsProviderService.getTimeToDiscard()
        && !tab->active 
        && (!SettingsProviderService.getNeverSuspendPinned() || !tab->pinned) 
        && (!SettingsProviderService.getNeverSuspendPlayingAudio() || !tab->audible)) {
      Vector.push(&output, (void **) &tab, false);
    }
  }
  return output;
}

tabs_service_namespace const TabsService = {
    getTabById,
    getLoadedTabById,
    getLoadedTabByIdAndWindowId,
    getTabByIdAndWindowId,
    getTabsThatShouldBeDiscarded,
};
