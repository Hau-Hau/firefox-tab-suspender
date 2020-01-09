#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "events_service.h"
#include "../../libs/vector/vector.h"
#include "../../models/window.h"
#include "../../models/tab.h"
#include "../cache_service/cache_service.h"
#include "../javascript_provider_service/javascript_provider_service.h"
#include "../settings_provider_service/settings_provider_service.h"
#include "../tabs_service/tabs_service.h"
#include "../windows_service/windows_service.h"

static void tabsOnActivatedHandle(const double **tabsBuffer, uint32_t tabsBufferSize) {
  while (tabsBufferSize--) {
    uint32_t tabId = (uint32_t) tabsBuffer[tabsBufferSize][1];
    bool active = (bool) tabsBuffer[tabsBufferSize][2];
    bool discarded = (bool) tabsBuffer[tabsBufferSize][3];
    bool pinned = (bool) tabsBuffer[tabsBufferSize][4];
    bool audible = (bool) tabsBuffer[tabsBufferSize][5];
    double lastAccessed = tabsBuffer[tabsBufferSize][6];

    struct Tab *tab = TabsService.getTabById(tabId);
    if (tab == NULL) {
      continue;
    }

    if ((discarded  && !active)
        || (SettingsProviderService.getNeverSuspendPinned() && tab->pinned)
        || (SettingsProviderService.getNeverSuspendPlayingAudio() && tab->audible)) {
      tab->lastUsageTime = (double) time(NULL);
      continue;
    }

    if (active || tab->active) {
      tab->lastUsageTime = (double) time(NULL);
    }
    tab->active = active;
    tab->discarded = discarded;
    tab->pinned = pinned;
    tab->audible = audible;

    if (!tab->active
        && !tab->discarded
        && (!SettingsProviderService.getNeverSuspendPinned() || !tab->pinned)
        && (!SettingsProviderService.getNeverSuspendPlayingAudio() || !tab->audible)) {
      Vector.push(CacheService.getLoadedTabs(), (void **) &tab, false);
    }
  }
  JavaScriptProviderService.expiredTabsWatcher();
}

static void windowsOnCreatedHandle(const uint32_t *buffer) {
  uint32_t windowId = (uint32_t) buffer[0];

  struct Window *window = WindowsService.getWindowById(windowId);
  if (window != NULL) {
    return;
  }

  window = malloc(sizeof(struct Window));
  window->id = windowId;
  window->tabs = Vector.constructor();
  Vector.push(CacheService.getWindows(), (void **) &window, false);
}

static void windowsOnRemovedHandle(const uint32_t *buffer) {
  uint32_t windowId = (uint32_t) buffer[0];

  struct Window *window = WindowsService.getWindowById(windowId);
  if (window == NULL) {
    return;
  }

  int32_t index = Vector.getIndex(*CacheService.getWindows(), window);
  if (index == -1) {
    return;
  }

  Vector.deconstructor(window->tabs);
  Vector.splice(CacheService.getWindows(), (uint32_t) index, true);
  JavaScriptProviderService.expiredTabsWatcher();
}

static void tabsOnCreatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];
  bool active = (bool) buffer[2];
  bool discarded = (bool) buffer[3];
  bool pinned = (bool) buffer[4];
  bool audbile = (bool) buffer[5];

  struct Window *window = WindowsService.getWindowById(windowId);
  if (window == NULL) {
    windowsOnCreatedHandle(buffer);
    tabsOnCreatedHandle(buffer, bufferSize);
    return;
  }

  struct Tab *tab = TabsService.getTabByIdAndWindowId(tabId, windowId);
  if (tab != NULL) {
    return;
  }

  tab = malloc(sizeof(struct Tab));
  tab->windowId = windowId;
  tab->id = tabId;
  tab->active = active;
  tab->discarded = discarded;
  tab->pinned = pinned;
  tab->audible = audbile;
  tab->lastUsageTime = (double) time(NULL);

  Vector.push(&window->tabs, (void **) &tab, false);

  if (!tab->active
      && (!SettingsProviderService.getNeverSuspendPinned() || !tab->pinned)
      && (!SettingsProviderService.getNeverSuspendPlayingAudio() || !tab->audible)) {
    Vector.push(CacheService.getLoadedTabs(), (void **) &tab, false);
  }
  JavaScriptProviderService.expiredTabsWatcher();
}

static void passTabToNextWindow(const uint32_t newWindowId,
                                const uint32_t oldWindowIndex,
                                const uint32_t oldWindowTabIndex) {
  struct Window *window = WindowsService.getWindowById(newWindowId);
  if (window == NULL) {
    return;
  }

  struct Window *oldWindow = CacheService.getWindows()->items[oldWindowIndex];
  struct Tab *oldWindowTab = oldWindow->tabs.items[oldWindowTabIndex];

  oldWindowTab->windowId = newWindowId;
  oldWindowTab->lastUsageTime = (double) time(NULL);
  Vector.push(&window->tabs, &oldWindow->tabs.items[oldWindowTabIndex], false);
  Vector.splice(&oldWindow->tabs, oldWindowTabIndex, false);
  JavaScriptProviderService.expiredTabsWatcher();
}

static void tabsOnUpdatedHandle(const uint32_t *buffer) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];
  uint8_t pinned = (uint8_t) buffer[2];
  uint8_t audible = (uint8_t) buffer[3];

  struct Tab *tab = TabsService.getTabById(tabId);

  if (tab != NULL && tab->windowId != windowId) {
    struct Window *window = WindowsService.getWindowById(tab->windowId);
    const int32_t windowIndex = Vector.getIndex(*CacheService.getWindows(), window);
    const int32_t tabIndex = Vector.getIndex(window->tabs, tab);

    if (windowIndex == -1 || tabIndex == -1) {
      return;
    }

    passTabToNextWindow(windowId, (const uint32_t) windowIndex, (const uint32_t) tabIndex);
  }

  tab = TabsService.getTabById(tabId);
  if (tab == NULL) {
    return;
  }

  if (pinned <= 1) {
    tab->pinned = (bool) pinned;
    tab->lastUsageTime = (double) time(NULL);
  }

  if (audible <= 1) {
    tab->audible = (bool) audible;
    tab->lastUsageTime = (double) time(NULL);
  }
}

static void tabsOnRemovedHandle(const uint32_t *buffer) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];

  struct Tab *tab = TabsService.getLoadedTabByIdAndWindowId(tabId, windowId);
  if (tab == NULL) {
    return;
  }
  struct Window *window = WindowsService.getWindowById(tab->windowId);
  if (window == NULL) {
    return;
  }

  int32_t index = Vector.getIndex(*CacheService.getLoadedTabs(), tab);
  if (index == -1) {
    return;
  }
  Vector.splice(CacheService.getLoadedTabs(), (uint32_t) index, false);

  index = Vector.getIndex(window->tabs, tab);
  if (index == -1) {
    return;
  }
  Vector.splice(&window->tabs, (uint32_t) index, true);
  JavaScriptProviderService.expiredTabsWatcher();
}

static void discardTabs() {
  struct Vector tabs = TabsService.getTabsThatShouldBeDiscarded();
  if (tabs.size == 0 && CacheService.getLoadedTabs()->size != 0) {
    Vector.deconstructor(tabs);
    JavaScriptProviderService.expiredTabsWatcher();
    return;
  }

  uint32_t index = tabs.size;
  while (index--) {
    struct Tab *tab = tabs.items[index];
    JavaScriptProviderService.chromeTabsDiscard(tab->id);
    tab->discarded = true;
    Vector.splice(CacheService.getLoadedTabs(), (uint32_t) Vector.getIndex(tabs, tab), false);
  }

  if (CacheService.getLoadedTabs()->size == 0) {
    JavaScriptProviderService.clearInterval();
  }
  Vector.deconstructor(tabs);
}

events_service_namespace const EventsService = {
    tabsOnActivatedHandle,
    windowsOnCreatedHandle,
    windowsOnRemovedHandle,
    tabsOnCreatedHandle,
    tabsOnUpdatedHandle,
    tabsOnRemovedHandle,
    discardTabs
};

