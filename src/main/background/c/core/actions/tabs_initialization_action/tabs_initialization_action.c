#include <stdint.h>
#include "../../../infrastructure/providers/javascript_functions_provider/javascript_functions_provider.h"
#include "../../services/events_service/events_service.h"
#include "tabs_initialization_action.h"

static void run(const uint32_t** buffer, uint32_t bufferSize, const uint32_t segmentSize) {
  while (bufferSize--) {
    EventsService.tabsOnCreatedHandle(buffer[bufferSize], segmentSize);
  }
  JavascriptFunctionsProvider.expiredTabsWatcher();
}

tabs_initialization_action_namespace const TabsInitializationAction = { run };
