#include <stdlib.h>
#include <stdint.h>
#include "../cache_service/cache_service.h"
#include "../../models/window.h"
#include "windows_service.h"

static struct Window *getWindowById(int32_t id) {
  uint32_t index = CacheService.getWindows()->size;
  while (index--) {
    struct Window *window = CacheService.getWindows()->items[index];
    if (window->id == id) {
      return window;
    }
  }
  return NULL;
}

windows_service_namespace const WindowsService = {
    getWindowById,
};
