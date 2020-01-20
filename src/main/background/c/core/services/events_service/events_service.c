#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <time.h>
#include "../../../infrastructure/libs/vector/vector.h"
#include "../../data/models/tab/tab.h"
#include "../../data/models/window/window.h"
#include "../../data/repositories/cache_repository/cache_repository.h"
#include "../../data/repositories/settings_repository/settings_repository.h"
#include "../../data/repositories/tabs_repository/tabs_repository.h"
#include "../../data/repositories/windows_repository/windows_repository.h"
#include "../../providers/javascript_functions_provider/javascript_functions_provider.h"
#include "events_service.h"

static void tabsOnActivatedHandle(const double** tabsBuffer, uint32_t tabsBufferSize) {
  while (tabsBufferSize--) {
    uint32_t tabId = (uint32_t) tabsBuffer[tabsBufferSize][1];
    bool active = (bool) tabsBuffer[tabsBufferSize][2];
    bool discarded = (bool) tabsBuffer[tabsBufferSize][3];
    bool pinned = (bool) tabsBuffer[tabsBufferSize][4];
    bool audible = (bool) tabsBuffer[tabsBufferSize][5];

    struct Tab* tab = TabsRepository.getTabById(tabId);
    if (tab == NULL) {
      continue;
    }

    if ((discarded && !active) || (SettingsRepository.getNeverSuspendPinned() && tab->pinned) ||
        (SettingsRepository.getNeverSuspendPlayingAudio() && tab->audible)) {
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
  }
  JavascriptFunctionsProvider.expiredTabsWatcher();
}

static void windowsOnCreatedHandle(const uint32_t* buffer) {
  uint32_t windowId = (uint32_t) buffer[0];

  struct Window* window = WindowsRepository.getWindowById(windowId);
  if (window != NULL) {
    return;
  }

  window = Window.constructor(windowId);
  CacheRepository.pushWindow((void**) &window);
}

static void windowsOnRemovedHandle(const uint32_t* buffer) {
  uint32_t windowId = (uint32_t) buffer[0];

  struct Window* window = WindowsRepository.getWindowById(windowId);
  if (window == NULL) {
    return;
  }

  int32_t index = Vector.getIndex(CacheRepository.getWindows(), window);
  if (index == -1) {
    return;
  }

  Vector.destructor(window->tabs);
  CacheRepository.removeWindow(index);
  JavascriptFunctionsProvider.expiredTabsWatcher();
}

static void tabsOnCreatedHandle(const uint32_t* buffer, uint32_t bufferSize) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];
  bool active = (bool) buffer[2];
  bool discarded = (bool) buffer[3];
  bool pinned = (bool) buffer[4];
  bool audbile = (bool) buffer[5];

  struct Window* window = WindowsRepository.getWindowById(windowId);
  if (window == NULL) {
    windowsOnCreatedHandle(buffer);
    tabsOnCreatedHandle(buffer, bufferSize);
    return;
  }

  struct Tab* tab = TabsRepository.getTabByIdAndWindowId(tabId, windowId);
  if (tab != NULL) {
    return;
  }

  tab = Tab.constructor(tabId, windowId, active, discarded, pinned, audbile);
  Vector.push(&window->tabs, (void**) &tab, false);

  JavascriptFunctionsProvider.expiredTabsWatcher();
}

static void passTabToNextWindow(const uint32_t newWindowId, const uint32_t oldWindowIndex,
                                const uint32_t oldWindowTabIndex) {
  struct Window* window = WindowsRepository.getWindowById(newWindowId);
  if (window == NULL) {
    return;
  }

  struct Window* oldWindow = CacheRepository.getWindows().items[oldWindowIndex];
  struct Tab* oldWindowTab = oldWindow->tabs.items[oldWindowTabIndex];

  oldWindowTab->windowId = newWindowId;
  oldWindowTab->lastUsageTime = (double) time(NULL);
  Vector.push(&window->tabs, &oldWindow->tabs.items[oldWindowTabIndex], false);
  Vector.splice(&oldWindow->tabs, oldWindowTabIndex, false);
  JavascriptFunctionsProvider.expiredTabsWatcher();
}

static void tabsOnUpdatedHandle(const uint32_t* buffer) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];
  uint8_t pinned = (uint8_t) buffer[2];
  uint8_t audible = (uint8_t) buffer[3];

  struct Tab* tab = TabsRepository.getTabById(tabId);

  if (tab != NULL && tab->windowId != windowId) {
    struct Window* window = WindowsRepository.getWindowById(tab->windowId);
    const int32_t windowIndex = Vector.getIndex(CacheRepository.getWindows(), window);
    const int32_t tabIndex = Vector.getIndex(window->tabs, tab);

    if (windowIndex == -1 || tabIndex == -1) {
      return;
    }

    passTabToNextWindow(windowId, (const uint32_t) windowIndex, (const uint32_t) tabIndex);
  }

  tab = TabsRepository.getTabById(tabId);
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

static void tabsOnRemovedHandle(const uint32_t* buffer) {
  uint32_t windowId = (uint32_t) buffer[0];
  uint32_t tabId = (uint32_t) buffer[1];

  struct Tab* tab = TabsRepository.getTabByIdAndWindowId(tabId, windowId);
  if (tab == NULL) {
    return;
  }

  struct Window* window = WindowsRepository.getWindowById(tab->windowId);
  if (window == NULL) {
    return;
  }

  int32_t index = Vector.getIndex(window->tabs, tab);
  if (index == -1) {
    return;
  }

  Vector.splice(&window->tabs, (uint32_t) index, true);
  JavascriptFunctionsProvider.expiredTabsWatcher();
}

static void discardTabs() {
  struct Vector tabs = TabsRepository.getTabsToDiscard();

  uint32_t index = tabs.size;
  while (index--) {
    struct Tab* tab = tabs.items[index];
    JavascriptFunctionsProvider.chromeTabsDiscard(tab->id, false);
    tab->discarded = true;
  }
  Vector.destructor(tabs);

  struct Vector notDiscardedTabs = TabsRepository.getNotDiscardedTabs(false);
  if (notDiscardedTabs.size == 0) {
    JavascriptFunctionsProvider.clearInterval();
  }
  Vector.destructor(notDiscardedTabs);
}

events_service_namespace const EventsService = { tabsOnActivatedHandle,
                                                 windowsOnCreatedHandle,
                                                 windowsOnRemovedHandle,
                                                 tabsOnCreatedHandle,
                                                 tabsOnUpdatedHandle,
                                                 tabsOnRemovedHandle,
                                                 discardTabs };
