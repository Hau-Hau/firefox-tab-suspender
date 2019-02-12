#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include "../models/event.h"
#include "../models/dynamic_array.h"
#include "../events/events.h"

static struct DynamicArray events;
static bool eventLoopWorking = false;

bool isEventLoopWorking() {
    return eventLoopWorking;
}

void initialize() {
    events.initialize(Event * *);
}

//0 tabsOnActivatedHandle
//1 windowsOnCreatedHandle
//2 windowsOnRemovedHandle
//3 tabsOnCreatedHandle
//4 tabsOnUpdatedHandle
//5 tabsOnRemovedHandle
//6 discardTabs
void processEvent() {
    if (eventLoopWorking || events.getSize() == 0) {
        eventLoopWorking = false;
        return;
    }
    eventLoopWorking = true;

    struct Event *event = ((Event **) events.getObject())[0];
    switch (event->eventId) {
        case 0:
            Events.tabsOnActivatedHandle(event->buffer2D, event->bufferSize2D, event->segmentSize2D);
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

    events.splice(0, true);

    if (events.getSize() == 0) {
        eventLoopWorking = false;
        return;
    }
    processEvent();
}
