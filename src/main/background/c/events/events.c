#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "events.h"
#include "../models/dynamic_array.h"
#include "../models/window.h"
#include "../models/tab.h"
#include "../services/cache/cache.h"
#include "../services/javascript_provider/javascript_provider.h"
#include "../services/settings_provider/settings_provider.h"

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 bool active,
//3 bool discarded,
//4 bool pinned
//5 bool audible
//6 double lastAccessed
static void tabsOnActivatedHandle(const double **tabsBuffer, uint32_t tabsBufferSize, const uint32_t segmentSize) {
    while (tabsBufferSize--) {
        uint32_t windowsIndex = Cache.getWindows()->size;
        while (windowsIndex--) {
            uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
            while (tabsIndex--) {
                if (((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id != (uint32_t) tabsBuffer[tabsBufferSize][1]) {
                    continue;
                }

                if (((bool) tabsBuffer[tabsBufferSize][3] && (bool) !tabsBuffer[tabsBufferSize][2])
                    || (SettingsProvider.getNeverSuspendPinned() && ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->pinned)
                    || (SettingsProvider.getNeverSuspendPlayingAudio() &&
                        ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->audible)) {
                    break;
                }

                if ((bool) tabsBuffer[tabsBufferSize][2] || ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->active) {
                    ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->lastUsageTime = tabsBuffer[tabsBufferSize][6];
                }

                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->active = (bool) tabsBuffer[tabsBufferSize][2];
                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->discarded = (bool) tabsBuffer[tabsBufferSize][3];
                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->pinned = (bool) tabsBuffer[tabsBufferSize][4];
                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->audible = (bool) tabsBuffer[tabsBufferSize][5];

                if (!((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->discarded &&
                    !((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->active) {
                    DynamicArrayOps.push(Cache.getLoadedTabs(), (void **) &((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex]);
                }
                break;
            }
        }
    }
    JavaScriptProvider.expiredTabsWatcher();
}

//0 windowId
static void windowsOnCreatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id == buffer[0]) {
            return;
        }
    }
    struct Window *window = malloc(sizeof(struct Window));
    DynamicArrayOps.constructor(&window->tabs);
    DynamicArrayOps.push(Cache.getWindows(), (void **) &window);
}

//0 windowId
static void windowsOnRemovedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id == buffer[0]) {
            free(((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array);
            DynamicArrayOps.splice(Cache.getWindows(), windowsIndex, true);
            return;
        }
    }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 bool active,
//3 bool discarded,
//4 bool pinned,
//5 bool audible
static void tabsOnCreatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
        while (tabsIndex--) {
            if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id == buffer[0] &&
                    ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id == buffer[1]) {
                return;
            }
        }

        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id == buffer[0]) {
            struct Tab *tab = malloc(sizeof(struct Tab));
            tab->windowId = (uint32_t) buffer[0];
            tab->id = (uint32_t) buffer[1];
            tab->active = (bool) buffer[2];
            tab->discarded = (bool) buffer[3];
            tab->pinned = (bool) buffer[4];
            tab->audible = (bool) buffer[5];
            tab->lastUsageTime = (double) time(NULL);

            DynamicArrayOps.push(&((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs, (void **) &tab);

            if (!tab->discarded && !tab->active) {
                DynamicArrayOps.push(Cache.getLoadedTabs(), (void **) &tab);
            }
            return;
        }
    }
    windowsOnCreatedHandle(buffer, 1);
    tabsOnCreatedHandle(buffer, bufferSize);
}

static void passTabToNextWindow(const uint32_t newWindowId, const uint32_t oldWindowIndex, const uint32_t oldWindowTabIndex) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id != newWindowId) {
            continue;
        }
        ((struct Tab *) ((struct Window *) Cache.getWindows()->array[oldWindowIndex])->tabs.array[oldWindowTabIndex])->windowId = newWindowId;
        DynamicArrayOps.push(Cache.getWindows(), (void **) &((struct Window *) Cache.getWindows()->array[oldWindowIndex])->tabs.array[oldWindowTabIndex]);
        DynamicArrayOps.splice(&((struct Window *) Cache.getWindows()->array[oldWindowIndex])->tabs, oldWindowTabIndex, false);
        return;
    }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 uint32_t pinned, states: 0-1 bool, > 1 ignored
//3 uint32_t audible, states: 0-1 bool, > 1 ignored
static void tabsOnUpdatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
        bool found = false;
        while (tabsIndex--) {
            if (((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->windowId != buffer[0] &&
                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id == buffer[1]) {
                passTabToNextWindow(buffer[0], windowsIndex, tabsIndex);
                found = true;
                break;
            }
        }
        if (found) {
            break;
        }
    }

    windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id == buffer[0]) {
            uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
            while (tabsIndex--) {
                if (((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id == buffer[1]) {
                    if (buffer[2] <= 1) {
                        ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->pinned = (bool) buffer[2];
                    }

                    if (buffer[3] <= 1) {
                        ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->audible = (bool) buffer[3];
                    }
                    return;
                }
            }
        }
    }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
static void tabsOnRemovedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        if (((struct Window *) Cache.getWindows()->array[windowsIndex])->id != buffer[0]) {
            continue;
        }

        uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
        while (tabsIndex--) {
            if (((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id != buffer[1]) {
                continue;
            }

            uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
            while (loadedTabsIndex--) {
                if (((struct Tab *) Cache.getLoadedTabs()->array[loadedTabsIndex])->windowId == buffer[0] &&
                        ((struct Tab *) Cache.getLoadedTabs()->array[loadedTabsIndex])->id == buffer[1]) {
                    DynamicArrayOps.splice(Cache.getLoadedTabs(), loadedTabsIndex, false);
                    break;
                }
            }
            DynamicArrayOps.splice(&((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs, tabsIndex, true);
            return;
        }
    }
}

static void discardTabs() {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        uint32_t tabsIndex = ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.size;
        while (tabsIndex--) {
            if ((uint8_t)(time(NULL) - ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->lastUsageTime >= SettingsProvider.getTimeToDiscard()
                    && !((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->active
                    && (!SettingsProvider.getNeverSuspendPinned() || !((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->pinned)
                    && (!SettingsProvider.getNeverSuspendPlayingAudio() || !((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->audible))) {
                JavaScriptProvider.chromeTabsDiscard(
                        ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->id,
                        (uint8_t) SettingsProvider.getDesaturateFavicon()
                );
                ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[tabsIndex])->discarded = true;
                uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
                while (loadedTabsIndex--) {
                    if (((struct Tab *) Cache.getLoadedTabs()->array[loadedTabsIndex])->discarded || ((struct Tab *) Cache.getLoadedTabs()->array[loadedTabsIndex])->active) {
                        DynamicArrayOps.splice(Cache.getLoadedTabs(), loadedTabsIndex, false);
                    }
                }
            }
        }
    }

    if (Cache.getLoadedTabs()->size == 0) {
        JavaScriptProvider.clearInterval();
        return;
    }

    bool found = false;
    windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
        while (loadedTabsIndex--) {
            if (((struct Tab *) Cache.getLoadedTabs()->array[loadedTabsIndex])->windowId == ((struct Tab *) ((struct Window *) Cache.getWindows()->array[windowsIndex])->tabs.array[loadedTabsIndex])->id) {
                found = true;
                break;
            }
        }
        if (found) {
            return;
        }
    }
    JavaScriptProvider.clearInterval();
}

events_namespace const Events = {
        tabsOnActivatedHandle,
        windowsOnCreatedHandle,
        windowsOnRemovedHandle,
        tabsOnCreatedHandle,
        tabsOnUpdatedHandle,
        tabsOnRemovedHandle,
        discardTabs
};
