#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "../models/settings.h"

// struct Settings settings;

// static struct Window **windows;
// static uint32_t windowsSize = 0;
// static uint32_t windowsCapacity = INITIAL_SIZE / 2;

// static struct Tab **loadedTabs;
// static uint32_t loadedTabsSize = 0;
// static uint32_t loadedTabsCapacity = INITIAL_SIZE;

// void initializeWindows() {
//     windows = malloc(windowsCapacity * sizeof(struct Windows *));
// }

// void initializeLoadedTabs() {
//     loadedTabs = malloc(loadedTabsCapacity * sizeof(struct Tab *));
// }


//0 uint32_t windowId,
//1 uint32_t tabId,
//2 bool active,
//3 bool discarded,
//4 bool pinned
//5 bool audible
//6 double lastAccessed
void tabsOnActivatedHandle(const double **tabsBuffer, uint32_t tabsBufferSize, const uint32_t segmentSize) {
    while (tabsBufferSize--) {
        uint32_t windowsIndex = windowsSize;
        while (windowsIndex--) {
            uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
            while (tabsIndex--) {
                if (windows[windowsIndex]->tabs[tabsIndex]->id != (uint32_t) tabsBuffer[tabsBufferSize][1]) {
                    continue;
                }

                if (((bool) tabsBuffer[tabsBufferSize][3] && (bool) !tabsBuffer[tabsBufferSize][2])
                    || (Settings.getNeverSuspendPinned() && windows[windowsIndex]->tabs[tabsIndex]->pinned)
                    || (Settings.getNeverSuspendPlayingAudio() && windows[windowsIndex]->tabs[tabsIndex]->audible)) {
                    break;
                }

                if ((bool) tabsBuffer[tabsBufferSize][2] || windows[windowsIndex]->tabs[tabsIndex]->active) {
                    windows[windowsIndex]->tabs[tabsIndex]->lastUsageTime = tabsBuffer[tabsBufferSize][6];
                }
                windows[windowsIndex]->tabs[tabsIndex]->active = (bool) tabsBuffer[tabsBufferSize][2];
                windows[windowsIndex]->tabs[tabsIndex]->discarded = (bool) tabsBuffer[tabsBufferSize][3];
                windows[windowsIndex]->tabs[tabsIndex]->pinned = (bool) tabsBuffer[tabsBufferSize][4];
                windows[windowsIndex]->tabs[tabsIndex]->audible = (bool) tabsBuffer[tabsBufferSize][5];

                if (!windows[windowsIndex]->tabs[tabsIndex]->discarded &&
                    !windows[windowsIndex]->tabs[tabsIndex]->active) {
                    push((void **) loadedTabs, (void **) &windows[windowsIndex]->tabs[tabsIndex], &loadedTabsSize,
                         &loadedTabsCapacity);
                }
                break;
            }
        }
    }
    jsExpiredTabsWatcher();
}

//0 windowId
void windowsOnCreatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        if (windows[windowsIndex]->id == buffer[0]) {
            return;
        }
    }
    struct Window *window = malloc(sizeof(struct Window));
    window->id = buffer[0];
    window->tabs = malloc(INITIAL_SIZE * sizeof(struct Tab *));
    window->tabsSize = 0;
    window->tabsCapacity = INITIAL_SIZE;
    push((void **) windows, (void **) &window, &windowsSize, &windowsCapacity);
}

//0 windowId
void windowsOnRemovedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        if (windows[windowsIndex]->id == buffer[0]) {
            free(windows[windowsIndex]->tabs);
            splice((void **) windows, windowsIndex, &windowsSize, true);
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
void tabsOnCreatedHandle(const uint32_t *tabBuffer, uint32_t bufferSize) {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
        while (tabsIndex--) {
            if (windows[windowsIndex]->id == tabBuffer[0] &&
                windows[windowsIndex]->tabs[tabsIndex]->id == tabBuffer[1]) {
                return;
            }
        }
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
    windowsOnCreatedHandle(tabBuffer, 1);
    tabsOnCreatedHandle(tabBuffer, bufferSize);
}

//0 uint32_t windowId,
//1 uint32_t tabId,
//2 uint32_t pinned, states: 0-1 bool, > 1 ignored
//3 uint32_t audible, states: 0-1 bool, > 1 ignored
void tabsOnUpdatedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
        bool found = false;
        while (tabsIndex--) {
            if (windows[windowsIndex]->tabs[tabsIndex]->windowId != buffer[0] &&
                windows[windowsIndex]->tabs[tabsIndex]->id == buffer[1]) {
                passTabToNextWindow(buffer[0], windowsIndex, tabsIndex);
                found = true;
                break;
            }
        }
        if (found) {
            break;
        }
    }

    windowsIndex = windowsSize;
    while (windowsIndex--) {
        if (windows[windowsIndex]->id == buffer[0]) {
            uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
            while (tabsIndex--) {
                if (windows[windowsIndex]->tabs[tabsIndex]->id == buffer[1]) {
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
void tabsOnRemovedHandle(const uint32_t *buffer, uint32_t bufferSize) {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        if (windows[windowsIndex]->id != buffer[0]) {
            continue;
        }

        uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
        while (tabsIndex--) {
            if (windows[windowsIndex]->tabs[tabsIndex]->id != buffer[1]) {
                continue;
            }

            uint32_t loadedTabsIndex = loadedTabsSize;
            while (loadedTabsIndex--) {
                if (loadedTabs[loadedTabsIndex]->windowId == buffer[0] &&
                    loadedTabs[loadedTabsIndex]->id == buffer[1]) {
                    splice((void **) loadedTabs, loadedTabsIndex, &loadedTabsSize, false);
                    break;
                }
            }
            splice((void **) windows[windowsIndex]->tabs, tabsIndex, &windows[windowsIndex]->tabsSize, true);
            return;
        }
    }
}

void discardTabs() {
    uint32_t windowsIndex = windowsSize;
    while (windowsIndex--) {
        uint32_t tabsIndex = windows[windowsIndex]->tabsSize;
        while (tabsIndex--) {
            if ((uint8_t)(
                    time(NULL) - windows[windowsIndex]->tabs[tabsIndex]->lastUsageTime >= Settings.getTimeToDiscard()
                    && !windows[windowsIndex]->tabs[tabsIndex]->active
                    && (!Settings.getNeverSuspendPinned() || !windows[windowsIndex]->tabs[tabsIndex]->pinned)
                    && (!Settings.getNeverSuspendPlayingAudio() || !windows[windowsIndex]->tabs[tabsIndex]->audible))) {
                jsChromeTabsDiscard(
                        windows[windowsIndex]->tabs[tabsIndex]->id,
                        (uint8_t) Settings.getDesaturateFavicon()
                );
                windows[windowsIndex]->tabs[tabsIndex]->discarded = true;
                uint32_t loadedTabsIndex = loadedTabsSize;
                while (loadedTabsIndex--) {
                    if (loadedTabs[loadedTabsIndex]->discarded || loadedTabs[loadedTabsIndex]->active) {
                        splice((void **) loadedTabs, loadedTabsIndex, &loadedTabsSize, false);
                    }
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
    jsClearInterval();
}
