#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "utils/array_utils.h"
#include "models/tab.h"
#include "models/window.h"
#include "models/settings.h"
#include <emscripten.h> 
#define INITIAL_SIZE 32

extern void jsExpiredTabsWatcher(void);

extern void jsClearInterval(void);

extern void jsChromeTabsDiscard(uint32_t);

struct Settings settings;

static struct Window **windows;
static uint32_t windowsSize = 0;
static uint32_t windowsCapacity = INITIAL_SIZE / 2;

static struct Tab **loadedTabs;
static uint32_t loadedTabsSize = 0;
static uint32_t loadedTabsCapacity = INITIAL_SIZE;

//0 uint32_t timeToDiscard,
//1 bool neverSuspendPinned,
//2 bool neverSuspendPlayingAudio,
//3 bool neverSuspendUnsavedFormInput
EMSCRIPTEN_KEEPALIVE void initialize(const uint32_t *buffer, uint32_t bufferSize) {
  settings.timeToDiscard = buffer[0];
  settings.neverSuspendPinned = (bool) buffer[1];
  settings.neverSuspendPlayingAudio = (bool) buffer[2];
  settings.neverSuspendUnsavedFormInput = (bool) buffer[3];

  windows = malloc(windowsCapacity * sizeof(struct Windows *));
  loadedTabs = malloc(loadedTabsCapacity * sizeof(struct Tab *));

  jsExpiredTabsWatcher();
}

EMSCRIPTEN_KEEPALIVE void windowsOnCreatedHandle(uint32_t windowId) {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id == windowId) {
      return;
    }
  }
  struct Window *window = malloc(sizeof(struct Window));
  window->id = windowId;
  window->tabs = malloc(INITIAL_SIZE * sizeof(struct Tab *));
  window->tabsSize = 0;
  window->tabsCapacity = INITIAL_SIZE;
  push((void **) windows, (void **)  &window, &windowsSize, &windowsCapacity);
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 bool active,
//3 bool discarded,
//4 bool pinned,
//5 bool audible
EMSCRIPTEN_KEEPALIVE void tabsOnCreatedHandle(const uint32_t *tabBuffer, uint32_t bufferSize) {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id == tabBuffer[0]) {
      struct Tab *tab = malloc(sizeof(struct Tab));
      tab->windowId = (uint32_t) tabBuffer[0];
      tab->id = (uint32_t) tabBuffer[1];
      tab->active = (bool) tabBuffer[2];
      tab->discarded = (bool) tabBuffer[3];
      tab->pinned = (bool) tabBuffer[4];
      tab->audible = (bool) tabBuffer[5];
      tab->lastUsageTime = (double) time(NULL);

      push((void **) windows[windowsIndex]->tabs,
           (void **) &tab,
           &windows[windowsIndex]->tabsSize,
           &windows[windowsIndex]->tabsCapacity);

      if (!tab->discarded && !tab->active) {
        push((void **) loadedTabs, (void **) &tab, &loadedTabsSize, &loadedTabsCapacity);
      }
      return;
    }
  }
  windowsOnCreatedHandle((uint32_t) tabBuffer[0]);
  tabsOnCreatedHandle(tabBuffer, bufferSize);
}

EMSCRIPTEN_KEEPALIVE void tabsInitialization(const uint32_t **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
  while (bufferSize--) {
    tabsOnCreatedHandle(buffer[bufferSize], segmentSize);
  }
}

EMSCRIPTEN_KEEPALIVE void tabsOnRemovedHandle(uint32_t windowId, uint32_t tabId) {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id != windowId) {
      continue;
    }

    uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
    while (tabsIndex--) {
      if (windows[windowsIndex]->tabs[tabsIndex]->id != tabId) {
        continue;
      }

      uint32_t loadedTabsIndex = loadedTabsSize;
      while (loadedTabsIndex--) {
        if (loadedTabs[loadedTabsIndex]->windowId == windowId && loadedTabs[loadedTabsIndex]->id == tabId) {
          splice((void **) loadedTabs, loadedTabsIndex, &loadedTabsSize, false);
          break;
        }
      }
      splice((void **) windows[windowsIndex]->tabs, tabsIndex, &windows[windowsIndex]->tabsSize, true);
      return;
    }
  }
}

EMSCRIPTEN_KEEPALIVE void windowsOnRemovedHandle(uint32_t windowId) {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id == windowId) {
      free(windows[windowsIndex]->tabs);
      splice((void **) windows, windowsIndex, &windowsSize, true);
      return;
    }
  }
}

EMSCRIPTEN_KEEPALIVE void discardTabs() {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
		uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
    while (tabsIndex--) {
      if ((double) time(NULL) - windows[windowsIndex]->tabs[tabsIndex]->lastUsageTime <= settings.timeToDiscard
          || windows[windowsIndex]->tabs[tabsIndex]->discarded
          || windows[windowsIndex]->tabs[tabsIndex]->active
          || (settings.neverSuspendPinned && windows[windowsIndex]->tabs[tabsIndex]->pinned)
          || (settings.neverSuspendPlayingAudio && windows[windowsIndex]->tabs[tabsIndex]->audible)) {
        continue;
      }

      jsChromeTabsDiscard(windows[windowsIndex]->tabs[tabsIndex]->id);
      windows[windowsIndex]->tabs[tabsIndex]->discarded = true;
			
			uint32_t loadedTabsIndex = loadedTabsSize;
      while (loadedTabsIndex--) {
        if (!loadedTabs[loadedTabsIndex]->discarded || loadedTabs[loadedTabsIndex]->active) {
          splice((void **) loadedTabs, loadedTabsIndex, &loadedTabsSize, false);
				}
      }
    }
  }

  if (loadedTabsSize == 0) {
    jsClearInterval();
    return;
  }

  bool found = false;
  windowsIndex = windowsSize;
  while (windowsIndex--) {
    uint32_t loadedTabsIndex = loadedTabsSize;
    while (loadedTabsIndex--) {
      if (loadedTabs[loadedTabsIndex]->windowId == windows[windowsIndex]->id) {
        found = true;
        break;
      }
    }
		if (found) {
			return;
		}
  }
  if (!found) {
    jsClearInterval();
  }
}

EMSCRIPTEN_KEEPALIVE void passTabToNextWindow(const uint32_t newWindowId, struct Tab *tab, struct Window *oldWindow, const uint32_t tabIndexInOldWindow)  {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id == newWindowId) {
      tab->windowId = newWindowId;
      push((void **) windows[windowsIndex]->tabs, (void **)  &tab, &windows[windowsIndex]->tabsSize, &windows[windowsIndex]->tabsCapacity);
      splice((void **) *oldWindow->tabs, tabIndexInOldWindow, &(*oldWindow).tabsSize, false);
      return;
    }
  }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 uint32_t pinned, states: 0-1 bool, > 1 ingored
//3 uint32_t audible, states: 0-1 bool, > 1 ingored
EMSCRIPTEN_KEEPALIVE void tabsOnUpdatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
  uint32_t windowsIndex = windowsSize;
  while (windowsIndex--) {
    uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
    bool found = false;
    while (tabsIndex--) {
      if (windows[windowsIndex]->id != buffer[0] && windows[windowsIndex]->tabs[tabsIndex]->id == buffer[1]) {
        passTabToNextWindow(buffer[0], windows[windowsIndex]->tabs[tabsIndex], windows[windowsIndex], tabsIndex);
        found = true;
        break;
      }
    }
    if (found)  {
      break;
    }
  }

  windowsIndex = windowsSize;
  while (windowsIndex--) {
    if (windows[windowsIndex]->id == buffer[0]) {
      uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
      while (tabsIndex--) {
        if (windows[windowsIndex]->tabs[tabsIndex]->id == buffer[1])  {
          if (buffer[2] <= 1) {
            windows[windowsIndex]->tabs[tabsIndex]->pinned = (bool) buffer[2];
          }

          if (buffer[3] <= 1) {
            windows[windowsIndex]->tabs[tabsIndex]->audible = (bool) buffer[3];
          }
          return;
        }
      }
    }
  }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 bool active,
//3 bool discarded,
//4 bool pinned
//5 bool audible
//6 double lastAccessed
EMSCRIPTEN_KEEPALIVE void tabsOnActivatedHandle(const double **tabsBuffer, uint32_t tabsBufferSize, const uint32_t segmentSize) {
  while (tabsBufferSize--) {
    bool found = false;
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
      uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
      while (tabsIndex--) {
        if (windows[windowsIndex]->tabs[tabsIndex]->id != (uint32_t) tabsBuffer[tabsBufferSize][1]) {
          continue;
        }

        found = true;
        if (((bool) tabsBuffer[tabsBufferSize][3] && (bool) !tabsBuffer[tabsBufferSize][2])
            || (settings.neverSuspendPinned && windows[windowsIndex]->tabs[tabsIndex]->pinned)
            || (settings.neverSuspendPlayingAudio && windows[windowsIndex]->tabs[tabsIndex]->audible)) {
          break;
        }
        
        if ((bool) tabsBuffer[tabsBufferSize][2] || windows[windowsIndex]->tabs[tabsIndex]->active) {
          windows[windowsIndex]->tabs[tabsIndex]->lastUsageTime = tabsBuffer[tabsBufferSize][6];
        }
        windows[windowsIndex]->tabs[tabsIndex]->active = (bool) tabsBuffer[tabsBufferSize][2];
        windows[windowsIndex]->tabs[tabsIndex]->discarded = (bool) tabsBuffer[tabsBufferSize][3];
        windows[windowsIndex]->tabs[tabsIndex]->pinned = (bool) tabsBuffer[tabsBufferSize][4];
        windows[windowsIndex]->tabs[tabsIndex]->audible = (bool) tabsBuffer[tabsBufferSize][5];
        
				if (!windows[windowsIndex]->tabs[tabsIndex]->discarded && !windows[windowsIndex]->tabs[tabsIndex]->active) {
          push((void **) loadedTabs, (void **) &windows[windowsIndex]->tabs[tabsIndex], &loadedTabsSize, &loadedTabsCapacity);
        }
        break;
      }
    }
    if (!found) {
      windowsOnCreatedHandle((uint32_t) tabsBuffer[tabsBufferSize][0]);
      tabsOnCreatedHandle((uint32_t *) tabsBuffer[tabsBufferSize], segmentSize - 1);
    }
  }
  jsExpiredTabsWatcher();
}
