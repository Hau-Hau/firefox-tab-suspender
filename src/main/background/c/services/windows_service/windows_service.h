#ifndef FTS_WINDOWS_SERVICE_H
#define FTS_WINDOWS_SERVICE_H

typedef struct {
  struct Window * (*const getWindowById)(int32_t id);
} windows_service_namespace;

extern windows_service_namespace const WindowsService;

#endif
