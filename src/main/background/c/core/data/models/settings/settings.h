#ifndef FTS_SETTINGS_H
#define FTS_SETTINGS_H

#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

struct Settings {
  uint32_t timeToDiscard;

  bool neverSuspendPinned;

  bool neverSuspendUnsavedFormInput;

  bool neverSuspendPlayingAudio;

  bool desaturateFavicon;
};

typedef struct {
  struct Settings* (*const constructor)(uint32_t timeToDiscard, bool neverSuspendPinned,
                                        bool neverSuspendUnsavedFormInput, bool neverSuspendPlayingAudio,
                                        bool desaturateFavicon);

  void (*const destructor)(struct Settings* self);
} settings_namespace;

extern settings_namespace const Settings;

#endif
