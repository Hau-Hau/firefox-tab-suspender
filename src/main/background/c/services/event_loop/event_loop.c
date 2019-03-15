#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include "event_loop.h"
#include "../../models/event.h"
#include "../../utils/vector/vector.h"
#include "../../events/events.h"
#include "../cache/cache.h"

static bool eventLoopWorking = false;

static bool isEventLoopWorking() {
    return eventLoopWorking;
}

//0 tabsOnActivatedHandle
//1 windowsOnCreatedHandle
//2 windowsOnRemovedHandle
//3 tabsOnCreatedHandle
//4 tabsOnUpdatedHandle
//5 tabsOnRemovedHandle
//6 discardTabs
static void processEvent() {
    if (eventLoopWorking || Cache.getEvents()->size == 0) {
        eventLoopWorking = false;
        return;
    }
    eventLoopWorking = true;

    struct Event *event = Cache.getEvents()->items[0];
    switch (event->eventId) {
        case 0:
            Events.tabsOnActivatedHandle((const double **) event->buffer2D, event->bufferSize2D, event->segmentSize2D);
            break;
        case 1:
            Events.windowsOnCreatedHandle(event->buffer1D, event->bufferSize1D);
            break;
        case 2:
            Events.windowsOnRemovedHandle(event->buffer1D, event->bufferSize1D);
            break;
        case 3:
            Events.tabsOnCreatedHandle(event->buffer1D, event->bufferSize1D);
            break;
        case 4:
            Events.tabsOnUpdatedHandle(event->buffer1D, event->bufferSize1D);
            break;
        case 5:
            Events.tabsOnRemovedHandle(event->buffer1D, event->bufferSize1D);
            break;
        case 6:
            Events.discardTabs();
    }

    Vector.splice(Cache.getEvents(), 0, true);

    if (Cache.getEvents()->size == 0) {
        eventLoopWorking = false;
        return;
    }
    processEvent();
}

event_loop_namespace const EventLoop = {
        isEventLoopWorking,
        processEvent
};

