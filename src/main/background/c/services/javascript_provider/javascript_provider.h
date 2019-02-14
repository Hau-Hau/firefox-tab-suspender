#ifndef FTS_JAVASCRIPT_PROVIDER_H
#define FTS_JAVASCRIPT_PROVIDER_H

#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

typedef struct {
    void (*const initialize)(
            void (*fJsExpiredTabsWatcher)(void),
            void (*fJsClearInterval)(void),
            void (*fJsChromeTabsDiscard)(uint32_t, uint8_t)
    );

    void (*const expiredTabsWatcher)();

    void (*const clearInterval)();

    void (*const chromeTabsDiscard)(uint32_t tabId, bool desaturateFavicon);
} javascript_provider_namespace;

extern javascript_provider_namespace const JavaScriptProvider;

#endif
