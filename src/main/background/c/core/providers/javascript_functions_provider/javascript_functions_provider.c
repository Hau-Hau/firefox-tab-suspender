#include <stdint.h>
#include "javascript_functions_provider.h"

static void (*JsExpiredTabsWatcher)(void);

static void (*JsClearInterval)(void);

static void (*JsChromeTabsDiscard)(uint32_t, bool);

static void (*JsConsoleLog)(uint32_t);

static void initialize(void (*jsExpiredTabsWatcher)(void), void (*jsClearInterval)(void),
                       void (*jsChromeTabsDiscard)(uint32_t, bool), void (*jsConsoleLog)(uint32_t)) {
  JsExpiredTabsWatcher = jsExpiredTabsWatcher;
  JsClearInterval = jsClearInterval;
  JsChromeTabsDiscard = jsChromeTabsDiscard;
  JsConsoleLog = jsConsoleLog;
}

static void expiredTabsWatcher() {
  (*JsExpiredTabsWatcher)();
}

static void clearInterval() {
  (*JsClearInterval)();
}

static void chromeTabsDiscard(uint32_t tabId, bool isForced) {
  (*JsChromeTabsDiscard)(tabId, isForced);
}

static void consoleLog(uint32_t number) {
  (*JsConsoleLog)(number);
}

javascript_functions_provider_namespace const JavascriptFunctionsProvider = { initialize, expiredTabsWatcher,
                                                                              clearInterval, chromeTabsDiscard,
                                                                              consoleLog };
