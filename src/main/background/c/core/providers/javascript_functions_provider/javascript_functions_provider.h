#ifndef FTS_JAVASCRIPT_FUNCTIONS_PROVIDER_H
#define FTS_JAVASCRIPT_FUNCTIONS_PROVIDER_H

#include <stdbool.h>
#include <stdint.h>

typedef struct {
  void (*const initialize)(void (*jsExpiredTabsWatcher)(void), void (*jsClearInterval)(void),
                           void (*jsChromeTabsDiscard)(uint32_t*, uint32_t, bool), void (*jsConsoleLog)(uint32_t));

  void (*const expiredTabsWatcher)();

  void (*const clearInterval)();

  void (*const chromeTabsDiscard)(uint32_t* tabsId, uint32_t size, bool isForce);

  void (*const consoleLog)(uint32_t number);
} javascript_functions_provider_namespace;

extern javascript_functions_provider_namespace const JavascriptFunctionsProvider;

#endif
