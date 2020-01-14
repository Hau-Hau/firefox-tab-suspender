#include <stdint.h>
#include <stdlib.h>
#include "../../models/window/window.h"
#include "../cache_repository/cache_repository.h"
#include "windows_repository.h"

static struct Window* getWindowById(int32_t id) {
  uint32_t index = CacheRepository.getWindows().size;
  while (index--) {
    struct Window* window = CacheRepository.getWindows().items[index];
    if (window->id == id) {
      return window;
    }
  }
  return NULL;
}

windows_repository_namespace const WindowsRepository = { getWindowById };
