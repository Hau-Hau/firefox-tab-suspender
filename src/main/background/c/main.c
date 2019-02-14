#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "services/javascript_provider/javascript_provider.h"
#include "services/settings_provider/settings_provider.h"
#include "services/event_loop/event_loop.h"
#include "services/cache/cache.h"
#include "events/events.h"
#include "models/event.h"
#include <emscripten.h>

extern void jsExpiredTabsWatcher(void);

extern void jsClearInterval(void);

extern void jsChromeTabsDiscard(uint32_t, uint8_t);

//0 uint32_t timeToDiscard,
//1 bool neverSuspendPinned,
//2 bool neverSuspendPlayingAudio,
//3 bool neverSuspendUnsavedFormInput
//4 bool desaturateFavicon
EMSCRIPTEN_KEEPALIVE void cInitialize(const uint32_t *buffer, uint32_t bufferSize) {
    Cache.initialize();
    JavaScriptProvider.initialize(jsExpiredTabsWatcher, jsClearInterval, jsChromeTabsDiscard);
    SettingsProvider.initialize(
            buffer[0],
            (bool) buffer[1],
            (bool) buffer[2],
            (bool) buffer[3],
            (bool) buffer[4]
    );
}

EMSCRIPTEN_KEEPALIVE void
cTabsInitialization(const uint32_t **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
    while (bufferSize--) {
//        Events.tabsOnCreatedHandle(buffer[bufferSize], segmentSize);
    }
    jsExpiredTabsWatcher();
}

EMSCRIPTEN_KEEPALIVE int cCheckLastEvent(const uint8_t eventId) {
    return (int) !(Cache.getEvents()->size == 0
                   || ((struct Event *) Cache.getEvents()->array[Cache.getEvents()->size - 1])->eventId != eventId);
}

EMSCRIPTEN_KEEPALIVE void cPushEvent(const uint32_t eventId) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    DynamicArrayOps.push(Cache.getEvents(), (void **) &event);
    if (!EventLoop.isEventLoopWorking()) {
        EventLoop.processEvents();
    }
}

EMSCRIPTEN_KEEPALIVE void cPushEvent1D(const uint32_t eventId, uint32_t *buffer, uint32_t bufferSize) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    event->buffer1D = buffer;
    event->bufferSize1D = bufferSize;
    DynamicArrayOps.push(Cache.getEvents(), (void **) &event);
    if (!EventLoop.isEventLoopWorking()) {
        EventLoop.processEvents();
    }
}

EMSCRIPTEN_KEEPALIVE void
cPushEvent2D(const uint32_t eventId, double **buffer, uint32_t bufferSize, const uint32_t segmentSize) {
    struct Event *event = malloc(sizeof(struct Event));
    event->eventId = eventId;
    event->buffer2D = buffer;
    event->bufferSize2D = bufferSize;
    event->segmentSize2D = segmentSize;
    DynamicArrayOps.push(Cache.getEvents(), (void **) &event);
    if (!EventLoop.isEventLoopWorking()) {
        EventLoop.processEvents();
    }
}
