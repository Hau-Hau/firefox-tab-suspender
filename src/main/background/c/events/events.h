#ifndef FTS_EVENTS_H
#define FTS_EVENTS_H

typedef struct {
    void (*const tabsOnActivatedHandle)(const double **tabsBuffer, uint32_t tabsBufferSize, const uint32_t segmentSize);

    void (*const windowsOnCreatedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const windowsOnRemovedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const tabsOnCreatedHandle)(const uint32_t *tabBuffer, uint32_t bufferSize);

    void (*const tabsOnUpdatedHandle)(const uint32_t *buffer, uint32_t bufferSize);

    void (*const tabsOnRemovedHandle)(uint32_t windowId, uint32_t tabId);

    void (*const discardTabs)();
} Events;

#endif
