#ifndef FTS_JAVASCRIPT_PROVIDER_SERVICE_H
#define FTS_JAVASCRIPT_PROVIDER_SERVICE_H

#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

typedef struct {
    void (*const initialize)(
            void (*fJsExpiredTabsWatcher)(void),
            void (*fJsClearInterval)(void),
            void (*fJsChromeTabsDiscard)(uint32_t),
            void (*fJsConsoleLog)(uint32_t)
    );

    void (*const expiredTabsWatcher)();

    void (*const clearInterval)();

    void (*const chromeTabsDiscard)(uint32_t tabId);

    void (*const consoleLog)(uint32_t number);
} javascript_provider_service_namespace;

extern javascript_provider_service_namespace const JavaScriptProviderService;

#endif

