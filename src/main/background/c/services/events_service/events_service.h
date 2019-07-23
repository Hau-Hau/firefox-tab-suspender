#ifndef FTS_EVENTS_SERVICE_H
#define FTS_EVENTS_SERVICE_H

typedef struct {
    void (*const tabsOnActivatedHandle)(const double **buffer, uint32_t tabsBufferSize, const uint32_t segmentSize);

    void (*const windowsOnCreatedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const windowsOnRemovedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const tabsOnCreatedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const tabsOnUpdatedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const tabsOnRemovedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const discardTabs)();
} events_service_namespace;

extern events_service_namespace const EventsService;

#endif

