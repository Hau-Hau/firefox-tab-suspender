#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "javascript_provider.h"

static void (*jsExpiredTabsWatcher)(void);

static void (*jsClearInterval)(void);

static void (*jsChromeTabsDiscard)(uint32_t, uint8_t);

static void (*jsConsoleLog)(uint32_t);

static void initialize(
        void (*fJsExpiredTabsWatcher)(void),
        void (*fJsClearInterval)(void),
        void (*fJsChromeTabsDiscard)(uint32_t, uint8_t),
        void (*fJsConsoleLog)(uint32_t)) {
    jsExpiredTabsWatcher = fJsExpiredTabsWatcher;
    jsClearInterval = fJsClearInterval;
    jsChromeTabsDiscard = fJsChromeTabsDiscard;
    jsConsoleLog = fJsConsoleLog;
}

static void expiredTabsWatcher() {
    (*jsExpiredTabsWatcher)();
}

static void clearInterval() {
    (*jsClearInterval)();
}

static void chromeTabsDiscard(uint32_t tabId, bool desaturateFavicon) {
    (*jsChromeTabsDiscard)(tabId, (uint8_t) desaturateFavicon);
}

static void consoleLog(uint32_t number) {
    (*jsConsoleLog)(number);
}

javascript_provider_namespace const JavaScriptProvider = {
        initialize,
        expiredTabsWatcher,
        clearInterval,
        chromeTabsDiscard,
        consoleLog
};

