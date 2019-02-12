#include <stdio.h>
#include <time.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "utils/array_utils.h"
#include "models/tab.h"
#include "models/window.h"
#include "models/settings.h"
#include "services/event_loop.h"
#include <emscripten.h>

extern void jsExpiredTabsWatcher(void);

extern void jsClearInterval(void);

extern void jsChromeTabsDiscard(uint32_t, uint8_t);

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
//4 bool desaturateFavicon
EMSCRIPTEN_KEEPALIVE void cInitialize(const uint32_t *buffer, uint32_t bufferSize) {
    Settings.initialize(
            buffer[0],
            (bool) buffer[1],
            (bool) buffer[2],
            (bool) buffer[3],
            (bool) buffer[4]
    );

    EventLoop.initialize();

    windows = malloc(windowsCapacity * sizeof(struct Windows *));
    loadedTabs = malloc(loadedTabsCapacity * sizeof(struct Tab *));

    jsExpiredTabsWatcher();
}

EMSCRIPTEN_KEEPALIVE int cCheckLastEvent(const uint8_t eventId) {
    return (int) !(eventsSize == 0 || events[eventsSize - 1]->eventId != eventId);
}

EMSCRIPTEN_KEEPALIVE void cPushEvent(const uint32_t eventId) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    push((void **) events, (void **) &event, &eventsSize, &eventsCapacity);
    if (!EventLoop.isEventLoopWorking()) {
        EventLoop.processEvents();
    }
}

EMSCRIPTEN_KEEPALIVE void cPushEvent1D(const uint32_t eventId, const uint32_t *buffer, uint32_t bufferSize) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    event->buffer1D = buffer;
    event->bufferSize1D = bufferSize;
    push((void **) events, (void **) &event, &eventsSize, &eventsCapacity);
    if (!isEventLoopWorking) {
        EventLoop.processEvents();
    }
}

EMSCRIPTEN_KEEPALIVE void
cPushEvent2D(const uint32_t eventId, const double **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    event->buffer2D = buffer;
    event->bufferSize2D = bufferSize;
    event->segmentSize2D = segmentSize;
    push((void **) events, (void **) &event, &eventsSize, &eventsCapacity);
    if (!isEventLoopWorking) {
        EventLoop.processEvents();
    }
}
