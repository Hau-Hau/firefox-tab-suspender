#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "events.h"
#include "../utils/vector/vector.h"
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
        uint32_t tabId = (uint32_t) tabsBuffer[tabsBufferSize][1];
        bool active = (bool) tabsBuffer[tabsBufferSize][2];
        bool discarded = (bool) tabsBuffer[tabsBufferSize][3];
        bool pinned = (bool) tabsBuffer[tabsBufferSize][4];
        bool audible = (bool) tabsBuffer[tabsBufferSize][5];
        double lastAccessed = tabsBuffer[tabsBufferSize][6];

        uint32_t windowsIndex = Cache.getWindows()->size;
        while (windowsIndex--) {
            struct Window *window = Cache.getWindows()->items[windowsIndex];
            uint32_t tabsIndex = window->tabs.size;
            while (tabsIndex--) {
                struct Tab *tab = window->tabs.items[tabsIndex];
                if (tab->id != tabId) {
                    continue;
                }

                if ((discarded && !active)
                    || (SettingsProvider.getNeverSuspendPinned() && tab->pinned)
                    || (SettingsProvider.getNeverSuspendPlayingAudio() && tab->audible)) {
                    break;
                }

                if (active || tab->active) {
                    tab->lastUsageTime = (double) time(NULL);
                } else {
                    tab->lastUsageTime = lastAccessed;
                }


                tab->active = active;
                tab->discarded = discarded;
                tab->pinned = pinned;
                tab->audible = audible;

                if (!tab->discarded && !tab->active) {
                    Vector.push(Cache.getLoadedTabs(), (void **) &tab);
                }
                break;
            }
        }
    }
    JavaScriptProvider.expiredTabsWatcher();
}

//0 windowId
static void windowsOnCreatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowId = (uint32_t) buffer[0];

    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        if (window->id == windowId) {
            return;
        }
    }
    struct Window *window = malloc(sizeof(struct Window));
    window->id = windowId;
    Vector.constructor(&window->tabs);
    Vector.push(Cache.getWindows(), (void **) &window);
}

//0 windowId
static void windowsOnRemovedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowId = (uint32_t)buffer[0];

    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        if (window->id == windowId) {
            free(window->tabs.items);
            Vector.splice(Cache.getWindows(), windowsIndex, true);
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
    uint32_t windowId = (uint32_t) buffer[0];
    uint32_t tabId = (uint32_t) buffer[1];
    bool active = (bool) buffer[2];
    bool discarded = (bool) buffer[3];
    bool pinned = (bool) buffer[4];
    bool audbile = (bool) buffer[5];

    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        uint32_t tabsIndex = window->tabs.size;
        while (tabsIndex--) {
            struct Tab *tab = window->tabs.items[tabsIndex];

            if (window->id == windowId && tab->id == tabId) {
                return;
            }
        }

        if (window->id == windowId) {
            struct Tab *newTab = malloc(sizeof(struct Tab));
            newTab->windowId = windowId;
            newTab->id = tabId;
            newTab->active = active;
            newTab->discarded = discarded;
            newTab->pinned = pinned;
            newTab->audible = audbile;
            newTab->lastUsageTime = (double) time(NULL);

            Vector.push(&window->tabs, (void **) &newTab);

            if (!pinned && !discarded && !active) {
                Vector.push(Cache.getLoadedTabs(), (void **) &newTab);
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
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        if (window->id != newWindowId) {
            continue;
        }
        struct Window *oldWindow = Cache.getWindows()->items[oldWindowIndex];
        struct Tab *oldWindowTab = oldWindow->tabs.items[oldWindowTabIndex];

        oldWindowTab->windowId = newWindowId;
        Vector.push(&window->tabs, (void **) &oldWindow->tabs.items[oldWindowTabIndex]);
        Vector.splice(&oldWindow->tabs, oldWindowTabIndex, false);
        return;
    }
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 uint32_t pinned, states: 0-1 bool, > 1 ignored
//3 uint32_t audible, states: 0-1 bool, > 1 ignored
static void tabsOnUpdatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowId = (uint32_t) buffer[0];
    uint32_t tabId = (uint32_t) buffer[1];
    uint8_t pinned = (uint8_t) buffer[2];
    uint8_t audible = (uint8_t) buffer[3];

    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        uint32_t tabsIndex = window->tabs.size;
        bool found = false;
        while (tabsIndex--) {
            struct Tab *tab = window->tabs.items[tabsIndex];
            if (tab->windowId != windowId && tab->id == tabId) {
                passTabToNextWindow(windowId, windowsIndex, tabsIndex);
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
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        if (window->id == windowId) {
            uint32_t tabsIndex = window->tabs.size;
            while (tabsIndex--) {
                struct Tab *tab = window->tabs.items[tabsIndex];
                if (tab->id == tabId) {
                    if (pinned <= 1) {
                        tab->pinned = (bool) pinned;
                    }

                    if (audible <= 1) {
                        tab->audible = (bool) audible;
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
    uint32_t windowId = (uint32_t) buffer[0];
    uint32_t tabId = (uint32_t) buffer[1];

    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];

        if (window->id != windowId) {
            continue;
        }

        uint32_t tabsIndex = window->tabs.size;
        while (tabsIndex--) {
            struct Tab *tab = window->tabs.items[tabsIndex];

            if (tab->id != tabId) {
                continue;
            }

            uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
            while (loadedTabsIndex--) {
                struct Tab *loadedTab = Cache.getLoadedTabs()->items[loadedTabsIndex];

                if (loadedTab->windowId == windowId && loadedTab->id == tabId) {
                    Vector.splice(Cache.getLoadedTabs(), loadedTabsIndex, false);
                    break;
                }
            }
            Vector.splice(&window->tabs, tabsIndex, true);
            return;
        }
    }
}

static void discardTabs() {
    uint32_t windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        uint32_t tabsIndex = window->tabs.size;
        while (tabsIndex--) {
            struct Tab *tab = window->tabs.items[tabsIndex];

            if (time(NULL) - tab->lastUsageTime >= SettingsProvider.getTimeToDiscard()
                    && !tab->active
                    && (!SettingsProvider.getNeverSuspendPinned() || !tab->pinned)
                    && (!SettingsProvider.getNeverSuspendPlayingAudio() || !tab->audible)) {
                JavaScriptProvider.chromeTabsDiscard(
                        tab->id,
                        (uint8_t) SettingsProvider.getDesaturateFavicon()
                );

                tab->discarded = true;

                uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
                while (loadedTabsIndex--) {
                    struct Tab *loadedTab = Cache.getLoadedTabs()->items[loadedTabsIndex];
                    if (loadedTab->discarded || loadedTab->active) {
                        Vector.splice(Cache.getLoadedTabs(), loadedTabsIndex, false);
                    }
                }
            }
        }
    }

    if (Cache.getLoadedTabs()->size == 0) {
        JavaScriptProvider.clearInterval();
        return;
    }

    windowsIndex = Cache.getWindows()->size;
    while (windowsIndex--) {
        struct Window *window = Cache.getWindows()->items[windowsIndex];
        uint32_t loadedTabsIndex = Cache.getLoadedTabs()->size;
        while (loadedTabsIndex--) {
            struct Tab *loadedTab = Cache.getLoadedTabs()->items[loadedTabsIndex];
            if (loadedTab->windowId == window->id) {
                return;
            }
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

