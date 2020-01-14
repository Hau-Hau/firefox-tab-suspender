#ifndef FTS_WINDOWS_REPOSITORY_H
#define FTS_WINDOWS_REPOSITORY_H

typedef struct {
  struct Window* (*const getWindowById)(int32_t id);
} windows_repository_namespace;

extern windows_repository_namespace const WindowsRepository;

#endif
