#include <stdbool.h>
#include <stdint.h>
#include <time.h>
#include "../../../../infrastructure/libs/vector/vector.h"
#include "../../models/tab/tab.h"
#include "../../models/window/window.h"
#include "../cache_repository/cache_repository.h"
#include "../settings_repository/settings_repository.h"
#include "../windows_repository/windows_repository.h"
#include "tabs_repository.h"

static struct Tab* getTabById(int32_t id) {
  uint32_t windowsIndex = CacheRepository.getWindows().size;
  while (windowsIndex--) {
    struct Window* window = CacheRepository.getWindows().items[windowsIndex];
    uint32_t tabsIndex = window->tabs.size;
    while (tabsIndex--) {
      struct Tab* tab = window->tabs.items[tabsIndex];
      if (tab->id == id) {
        return tab;
      }
    }
  }
  return NULL;
}

static struct Tab* getTabByIdAndWindowId(int32_t tabId, int32_t windowId) {
  struct Window* window = WindowsRepository.getWindowById(windowId);
  if (window == NULL) {
    return NULL;
  }

  uint32_t tabsIndex = window->tabs.size;
  while (tabsIndex--) {
    struct Tab* tab = window->tabs.items[tabsIndex];
    if (tab->id == tabId) {
      return tab;
    }
  }
  return NULL;
}

static struct Vector getAllTabs() {
  struct Vector output = Vector.constructor();

  uint32_t windowsIndex = CacheRepository.getWindows().size;
  while (windowsIndex--) {
    struct Window* window = CacheRepository.getWindows().items[windowsIndex];
    uint32_t tabsIndex = window->tabs.size;
    while (tabsIndex--) {
      struct Tab* tab = window->tabs.items[tabsIndex];
      Vector.push(&output, (void**) &tab, false);
    }
  }
  return output;
}

static uint32_t getNotDiscardedTabsCount(bool includeActiveTabs) {
  uint32_t count = 0;
  struct Vector tabs = getAllTabs();
  uint32_t index = tabs.size;
  while (index--) {
    struct Tab* tab = tabs.items[index];
    if (!tab->discarded && (includeActiveTabs || !tab->active)) {
      count++;
    }
  }

  Vector.destructor(tabs);
  return count;
}

/**
 * @return Vector, items = uint32_t*
 */
static struct Vector getIdFromTabsToDiscard() {
  struct Vector tabs = getAllTabs();
  struct Vector output = Vector.constructor();

  uint32_t index = tabs.size;
  while (index--) {
    struct Tab* tab = tabs.items[index];
    if (time(NULL) - tab->lastUsageTime < SettingsRepository.getTimeToDiscard() || tab->active || tab->discarded ||
        (SettingsRepository.getNeverSuspendPinned() && tab->pinned) ||
        (SettingsRepository.getNeverSuspendPlayingAudio() && tab->audible)) {
      continue;
    }
    uint32_t* id = &tab->id;
    Vector.push(&output, (void**) id, false);
  }
  Vector.destructor(tabs);
  return output;
}

tabs_repository_namespace const TabsRepository = { getTabById, getTabByIdAndWindowId, getAllTabs,
                                                   getNotDiscardedTabsCount, getIdFromTabsToDiscard };
